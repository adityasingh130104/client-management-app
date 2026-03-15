# Universal Gym - Permanent Data Storage TODO

## Status: Implementing JSON File Persistence ✅ Plan Approved

**Current Progress:**
- [x] Understand codebase (in-memory → file-based)
- [x] Plan approved by user
- [x] 1. Update server.js with load/save functions
- [x] 2. Restart server (Ctrl+C → npm start)
- [x] 3. Test persistence: Add client → restart → verify data remains
- [ ] 4. Test mutations: Pay/Extend/Edit/Delete → check data/clients.json
- [x] 5. Update README with storage docs
- [ ] 6. Mark complete

**Next:** Test persistence and complete.

**Storage Details:**
- File: `data/clients.json`
- Loads on startup, saves after every change
- Compatible with existing UI/API

**Next:** Edit server.js → restart → test.

**Instructions:** After edits, run `npm start`, add a client, restart, verify persistence.
