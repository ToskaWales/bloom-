# Security Specification for Bloom

## Data Invariants
1. A user can only access their own profile, cycle data, seeds, workouts, and chat history.
2. Document IDs must be valid alphanumeric strings.
3. Timestamps must be validated (where applicable).
4. User names should be reasonably sized.

## The Dirty Dozen Payloads (Targeting Rejection)
1. **Identity Theft**: User A trying to write to `/users/userB`.
2. **Ghost Field**: Adding `isAdmin: true` to a profile update.
3. **ID Poisoning**: Using a 2KB string as a `seedId`.
4. **Self-Promotion**: Trying to change `role` in a chat message (if applicable).
5. **Orphaned Seed**: Writing a seed for a user that doesn't exist.
6. **Time Travel**: Setting `timestamp` to a future date in a chat message.
7. **Negative Age**: Setting `age` to -5 in profile.
8. **Massive Array**: Adding 10,000 symptoms to a seed document.
9. **Invalid Split**: Setting training split to "CrossFit" (not in enum).
10. **Shadow Update**: Updating `userId` in a subcollection document to point to someone else.
11. **PII Leak**: Authenticated user trying to list all users.
12. **State Jumper**: Trying to set `onboarded: true` without required fields.

## Test Runner (firestore.rules.test.ts)
```typescript
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  RulesTestEnvironment,
} from "@firebase/rules-unit-testing";
import { setDoc, getDoc, collection, addDoc } from "firebase/firestore";

let testEnv: RulesTestEnvironment;

beforeAll(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: "bloom-test",
    firestore: {
      rules: require("fs").readFileSync("firestore.rules", "utf8"),
    },
  });
});

beforeEach(async () => {
  await testEnv.clearFirestore();
});

afterAll(async () => {
  await testEnv.cleanup();
});

test("Users can only access their own data", async () => {
  const aliceAuth = { uid: "alice", email: "alice@example.com", email_verified: true };
  const bobAuth = { uid: "bob", email: "bob@example.com", email_verified: true };

  const aliceDb = testEnv.authenticatedContext(aliceAuth.uid, aliceAuth).firestore();
  const bobDb = testEnv.authenticatedContext(bobAuth.uid, bobAuth).firestore();

  // Alice creating her profile
  await assertSucceeds(setDoc(doc(aliceDb, "users/alice"), {
    name: "Alice",
    age: 25,
    trainingExperience: "Intermediate",
    primaryGoal: "Rise",
    onboarded: true
  }));

  // Alice trying to read Bob's profile (doesn't exist yet, but should fail if she tried)
  await assertFails(getDoc(doc(aliceDb, "users/bob")));

  // Bob trying to write to Alice's profile
  await assertFails(setDoc(doc(bobDb, "users/alice"), { name: "I am Bob" }));
});
```
