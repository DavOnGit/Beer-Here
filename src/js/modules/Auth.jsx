class Auth {
  /**
   * Authenticate a user. Save a token string in Local Storage
   *
   * @param {string} token
   */
  static authenticateUser (token, userName) {
    window.localStorage.setItem('token', token)
    window.localStorage.setItem('user_name', userName)
  }
  /**
   * Check if a user is authenticated - check if a token is saved in Local Storage
   *
   * @returns {boolean}
   */
  static isUserAuthenticated () {
    return window.localStorage.getItem('token') !== null
  }
  /**
   * Deauthenticate a user. Remove a token from Local Storage.
   *
   */
  static deauthenticateUser () {
    window.localStorage.removeItem('token')
    window.localStorage.removeItem('user_name')
  }
  /**
   * Get a token value.
   *
   * @returns {string}
   */
  static getToken () {
    return window.localStorage.getItem('token')
  }
}

export default Auth
