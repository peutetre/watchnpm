#!/bin/sh

ssh $1 "mongo landing-test --eval 'pc = db.people.find(); while(pc.hasNext()) { printjson(pc.next()); }'"
