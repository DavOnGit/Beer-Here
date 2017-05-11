import React from 'react'
import Route from 'react-router/lib/Route'
import IndexRoute from 'react-router/lib/IndexRoute'

import Base from '../components/Base'
import HomePage from '../containers/HomePage'
import SignUpPage from '../containers/SignUpPage'
import LoginPage from '../containers/LoginPage'
import NotFoundPage from '../components/NotFoundPage'
import Auth from '../modules/Auth'
import { login, logout } from '../actions/actions'

export function getRoutes (store) {
  function addUserName () {
    const name = window.localStorage.getItem('user_name')
    if (name !== null) store.dispatch(login(name))
  }

  function deauthenticateUser (nextState, replace) {
    Auth.deauthenticateUser()
    store.dispatch(logout())

    // Change the current URL to /
    replace('/')
  }

  return (
    <Route path='/' component={Base} onEnter={addUserName}>
      <IndexRoute component={HomePage} />

      <Route path='signup' component={SignUpPage} />
      <Route path='login' component={LoginPage} />
      <Route path='logout' onEnter={deauthenticateUser} />

      <Route path='*' component={NotFoundPage} />
    </Route>
  )
}
