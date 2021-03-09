import React, { useEffect } from "react";
import ChrisAPIClient from "./api/chrisapiclient";
import { AppContext } from "./context/context";
import { Types } from "./context/actions/types";
import { IUserState, UserResponse } from "./context/reducers/userReducer";

const RouterWrapper: React.FC = ({ children }) => {
    const { dispatch } = React.useContext(AppContext);

    useEffect(() => {
        const token = window.sessionStorage.getItem("AUTH_TOKEN");
        if (!!token) {
            const client: any = ChrisAPIClient.getClient();
            client.getUser().then((res: UserResponse) => {
            const user: IUserState = res?.data;
            dispatch({
                type: Types.Login_update,
                payload: user
            });
            })
        }
    }, [dispatch]);

    return (<>{children}</>);
}

export default RouterWrapper;
