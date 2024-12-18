import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  access_token: localStorage.getItem("access_token") || null,
  profile: {},
  govtIdTypes: []
}

export const authSlice = createSlice({
  name: 'auth_token',
  initialState,
  reducers: {
    setUserToken: (state, action) => {
      state.access_token = action.payload.access_token
    },
    unSetUserToken: (state, action) => {
      return initialState;
    },
    setProfile: (state, action) => {
      state.profile = action.payload.profile
    },
    setGovtIdType: (state, action) => {
      state.govtIdTypes = action.payload.data
    }
  }
})

export const { setUserToken, unSetUserToken, setProfile, setGovtIdType } = authSlice.actions

export default authSlice.reducer