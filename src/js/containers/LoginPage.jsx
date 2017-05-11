import React, { PropTypes } from 'react'
import { connect } from 'react-redux'

import LoginForm from '../components/LoginForm.jsx'
import Auth from '../modules/Auth'
import { login, setUserToBizList } from '../actions/actions'

class LoginPage extends React.Component {
  // Set the initial component state
  state = {
    user: {
      email: '',
      password: ''
    },
    errors: {}
  }

  /**
   * Process the form.
   *
   * @param {object} event - the JavaScript event object
   *
   */
  processForm = (event) => {
    event.preventDefault()

    const { bizs } = this.props

    // Create a string for an HTTP body message
    const email = encodeURIComponent(this.state.user.email)
    const password = encodeURIComponent(this.state.user.password)
    const bizsIdArray = bizs ? bizs.map(biz => biz.id) : []
    const bizsString = encodeURIComponent(JSON.stringify(bizsIdArray))
    const formData = `email=${email}&password=${password}&bizlist=${bizsString}`

    // Create an AJAX request
    const xhr = new window.XMLHttpRequest()
    xhr.open('post', '/auth/login')
    xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded')
    xhr.responseType = 'json'
    xhr.addEventListener('load', () => {
      if (xhr.status === 200) {
        // Success: empty error obj
        this.setState({ errors: {} })

        // Save the token and user name in localstorage & name in Redux store
        Auth.authenticateUser(xhr.response.token, xhr.response.user.name)
        this.props.dispatch(login(xhr.response.user.name))
        this.props.dispatch(setUserToBizList(xhr.response.payload))

        // Redirect to /
        this.context.router.replace('/')
      } else {
        // Failure: error handling
        const errors = xhr.response.errors ? xhr.response.errors : {}
        errors.summary = xhr.response.message

        this.setState({ errors })
      }
    })
    xhr.send(formData)
  }

  /**
   * Change the user state object.
   *
   * @param {object} event - the JavaScript event object
   *
   */
  changeUser = (event) => {
    const field = event.target.name
    const user = this.state.user
    user[field] = event.target.value

    this.setState({
      user
    })
  }

  /**
   * Render the component.
   */
  render () {
    return (
      <LoginForm
        onSubmit={this.processForm}
        onChange={this.changeUser}
        errors={this.state.errors}
        user={this.state.user}
      />
    )
  }
}

// get router context
LoginPage.contextTypes = {
  router: PropTypes.object.isRequired
}

const mapStateToProps = (state) => {
  return {
    bizs: state.yelpResults.businesses
  }
}

export default connect(
  mapStateToProps
)(LoginPage)
