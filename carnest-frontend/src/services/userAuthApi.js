import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

// Define a service using a base URL and expected endpoints
export const userAuthApi = createApi({
  reducerPath: 'userAuthApi',
  baseQuery: fetchBaseQuery({ baseUrl: `${process.env.REACT_APP_BASE_URL}/api/user/` }),
  endpoints: (builder) => ({
    registerUser: builder.mutation({
      query: (user) => {
        return {
          url: 'register/',
          method: 'POST',
          body: user,
          headers: {
            'Content-type': 'application/json',
          }
        }
      }
    }),
    loginUser: builder.mutation({
      query: (user) => {
        return {
          url: 'login/',
          method: 'POST',
          body: user,
          headers: {
            'Content-type': 'application/json',
          }
        }
      }
    }),
    changeUserPassword: builder.mutation({
      query: ({ actualData, access_token }) => {
        return {
          url: 'changepassword/',
          method: 'POST',
          body: actualData,
          headers: {
            'authorization': `Bearer ${access_token}`,
          }
        }
      }
    }),
    sendPasswordResetEmail: builder.mutation({
      query: (user) => {
        return {
          url: 'send-reset-password-email/',
          method: 'POST',
          body: user,
          headers: {
            'Content-type': 'application/json',
          }
        }
      }
    }),
    resetPassword: builder.mutation({
      query: ({ actualData, id, token }) => {
        return {
          url: `/reset-password/${id}/${token}/`,
          method: 'POST',
          body: actualData,
          headers: {
            'Content-type': 'application/json',
          }
        }
      }
    }),
    userProfile: builder.mutation({
      query: (access_token) => {
        return {
          url: `/profile`,
          method: 'GET',
          headers: {
            'Content-type': 'application/json',
            'Authorization': `Bearer ${access_token}`
          }
        }
      }
    }),
    updateUserProfile: builder.mutation({
      query: ({actualData, access_token, user}) => {
        return {
          url: `/profile/${user}/`,
          method: 'PATCH',
          body: actualData,
          headers: {
            'Authorization': `Bearer ${access_token}`
          }
        }
      }
    }),
    getGovtIdType: builder.mutation({
      query: (access_token) => {
        return {
          url: `/government-id-types/`,
          method: 'GET',
          headers: {
            'Content-type': 'application/json',
            'Authorization': `Bearer ${access_token}`
          }
        }
      }
    }),
  }),
});

export const { 
  useRegisterUserMutation, 
  useLoginUserMutation, 
  useChangeUserPasswordMutation, 
  useSendPasswordResetEmailMutation, 
  useResetPasswordMutation, 
  useUserProfileMutation, 
  useUpdateUserProfileMutation,
  useGetGovtIdTypeMutation,
} = userAuthApi