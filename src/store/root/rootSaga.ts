import { all, fork } from "redux-saga/effects";

/// ADD ALL Local Sagas:
import { userSaga } from "../user/saga";

export function* rootSaga() {
  yield all([
    fork(userSaga),
  ]);
}
