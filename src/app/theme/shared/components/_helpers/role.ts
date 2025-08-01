export enum Role {

  UserVisa = 'USER_VISA',
  UserMastercard = 'USER_MASTERCARD',
  User = 'USER',
  
  Admin = 'ADMIN',
  AdminVisa = 'ADMIN_VISA',
  AdminMastercard = 'ADMIN_MASTERCARD',

  Manager ='MANAGER',
  ManagerVisa = 'MANAGER_VISA',
  ManagerMastercard = 'MANAGER_MASTERCARD',

}

export const UserRoles = {
  User: ['USER_VISA', 'USER_MASTERCARD'],
}

export const AdminRoles = {
  Admin: ['ADMIN_VISA', 'ADMIN_MASTERCARD'],
}

export const ManagerRoles = {
  Manager: ['MANAGER_VISA', 'MANAGER_MASTERCARD'],
}
