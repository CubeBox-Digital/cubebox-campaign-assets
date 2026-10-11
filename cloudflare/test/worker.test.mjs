import test from "node:test";
import assert from "node:assert/strict";
import { resolveTarget, signatureHex, publishScheduled } from "../src/worker.mjs";

const stamp = iso => Date.parse(iso);
const item = (cron,date) => resolveTarget(cron,stamp(date));
test("core accounts and scheduled times",()=>{
  assert.equal(item("45 4 * * *","2026-10-11T04:45:00Z").account,"umrohfriendly");
  assert.equal(item("30 5 * * *","2026-10-11T05:30:00Z").media_type,"story");
  assert.equal(item("30 12 * * *","2026-10-11T12:30:00Z").account,"infoumrohhemat");
});
test("MHT weekly feed vs story",()=>{
  for (const [date,expected] of [
    ["2026-10-05","feed"],["2026-10-06","story"],["2026-10-07","feed"],
    ["2026-10-08","story"],["2026-10-09","feed"],["2026-10-10","story"],
    ["2026-10-11","story"]
  ]) assert.equal(item("45 13 * * *",date+"T13:45:00Z").media_type,expected);
});
test("Sunday dual-slot correct",()=>{
  assert.equal(item("15 13 * * 0","2026-10-11T13:15:00Z").media_type,"feed");
  assert.equal(item("45 13 * * *","2026-10-11T13:45:00Z").media_type,"story");
  assert.throws(()=>item("15 13 * * 0","2026-10-10T13:15:00Z"),/Sunday/);
});
test("uses scheduled original date regardless execution delay",()=>{
  assert.equal(item("45 13 * * *","2026-10-10T13:45:00Z").date,"2026-10-10");
});
test("unknown schedule fails closed",()=>assert.throws(()=>item("* * * * *","2026-10-11T13:45:00Z"),/unknown/));
test("HMAC stable with WebCrypto",async ()=>{
 const a=await signatureHex("a".repeat(48),"1791700000000",'{"x":1}');
 const b=await signatureHex("a".repeat(48),"1791700000000",'{"x":1}');
 assert.match(a,/^[0-9a-f]{64}$/); assert.equal(a,b);
 assert.notEqual(a,await signatureHex("a".repeat(48),"1791700000000",'{"x":2}'));
});
test("shadow mode defaults on and request signed",async()=>{
 const scheduledTime=stamp("2026-10-11T04:45:00Z"),now=scheduledTime+60_000;
 let calls=0;
 const result=await publishScheduled({cron:"45 4 * * *",scheduledTime},{WSM_CF_HMAC_SECRET:"x".repeat(48)},async (_url,req)=>{
  calls++;
  assert.equal(JSON.parse(req.body).dry_run,true);
  assert.match(req.headers["x-wsm-signature"],/^sha256=[a-f0-9]{64}$/);
  return {ok:true,json:async()=>({status:"no_op"})};
 },now);
 assert.equal(calls,1);assert.equal(result.dry_run,true);
});
test("publication allowed only when explicitly flipped",async()=>{
 const scheduledTime=stamp("2026-10-11T12:30:00Z");
 const r=await publishScheduled({cron:"30 12 * * *",scheduledTime},{WSM_CF_HMAC_SECRET:"x".repeat(48),WSM_SHADOW_MODE:"false"},async (_,req)=>{
  assert.equal(JSON.parse(req.body).dry_run,false);
  return {ok:true,json:async()=>({status:"already_published",mediaId:"18100001"})};
 },scheduledTime+60_000);
 assert.equal(r.status,"already_published");
});
test("cross-day delayed trigger is no-op without external request",async()=>{
 const start=stamp("2026-10-10T13:45:00Z"),late=stamp("2026-10-11T17:05:00Z");
 const r=await publishScheduled({cron:"45 13 * * *",scheduledTime:start},{},()=>{throw Error("should not call")},late);
 assert.equal(r.reason,"cross_day_delayed");
});
test("early triggers no-op",async()=>{
 const start=stamp("2026-10-11T13:45:00Z");
 const r=await publishScheduled({cron:"45 13 * * *",scheduledTime:start},{},()=>{throw Error("should not call")},start-60_000);
 assert.equal(r.reason,"not_due");
});
test("unconfigured secret rejects before network write",async()=>{
 const start=stamp("2026-10-11T12:30:00Z");
 await assert.rejects(()=>publishScheduled({cron:"30 12 * * *",scheduledTime:start},{},()=>{throw Error("unexpected")},start+60_000),/secret/);
});
test("publisher HTTP error is failure, not falsely reported as success",async()=>{
 const start=stamp("2026-10-11T12:30:00Z");
 await assert.rejects(()=>publishScheduled({cron:"30 12 * * *",scheduledTime:start},{WSM_CF_HMAC_SECRET:"x".repeat(48)},async()=>({ok:false,status:401,json:async()=>({error:"invalid signature"})}),start+60_000),/HTTP 401/);
});
