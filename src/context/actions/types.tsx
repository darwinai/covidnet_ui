export type ActionMap<M extends { [index: string]: any }> = {
  [Key in keyof M]: M[Key] extends undefined
  ? {
    type: Key;
  }
  : {
    type: Key;
    payload: M[Key];
  }
};


export enum Types {
  Login_update = 'LOGIN_UPDATE',
  Logout_update = 'LOGOUT_UPDATE'
}

export enum AnalysisTypes {
  Update_list = 'UPDATE_LIST',
  Update_page = 'UPDATE_PAGE',
  Update_perpage = 'UPDATE_PERPAGE',
  Update_total = 'UPDATE_TOTAL'
}