import service from './request'

export const getAdminTenants = async () => {
  return service({
    url: '/admin/tenants',
    method: 'get'
  })
}

export const getAdminTenant = async (id) => {
  return service({
    url: `/admin/tenants/${id}`,
    method: 'get'
  })
}
