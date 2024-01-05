import {signal} from "@preact/signals-react";

//Signal to login token
export const jwtToken = signal('');
//Signal for saving username
export const UsernameSignal = signal('');
//Signal for saving customer ID
export const CustomerIDSignal = signal('');
//Signal for login window
export const LoginFormOpen = signal(false);
// Signal for register window
export const RegisterFormOpen = signal(false);
// Signal for register success
export const RegisterSuccess = signal(false);
//Signal for delete user
export const delUser = signal(false);
//Signal for create group window
export const CreateGroupFormOpen = signal(false);
//Signal for group created
export const GroupCreated = signal(false);
//Signal for groupmembership check
