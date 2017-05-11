import { PropTypes, default as React } from 'react'

import SignUpForm from '../components/SignUpForm.jsx'

class SignUpPage extends React.Component {
  // set the initial component state
  state = {
    user: {
      email: '',
      name: '',
      password: ''
    },
    errors: {}
  }

  /**
   * Change the user object.
   *
   * @param {object} event - the JavaScript event object
   *
   */
  changeUser = (event) => {
    const field = event.target.name
    const user = this.state.user

    user[field] = event.target.value

    this.setState({ user })
  }

  /**
   * Process the form.
   *
   * @param {object} event - the JavaScript event object
   *
   */
  processForm = (event) => {
    // prevent default action. in this case, action is the form submission event
    event.preventDefault()

    // create a string for an HTTP body message
    const name = encodeURIComponent(this.state.user.name)
    const email = encodeURIComponent(this.state.user.email)
    const password = encodeURIComponent(this.state.user.password)
    const formData = `name=${name}&email=${email}&password=${password}`

    // create an AJAX request
    const xhr = new window.XMLHttpRequest()
    xhr.open('post', '/auth/signup')
    xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded')
    xhr.responseType = 'json'
    xhr.addEventListener('load', () => {
      if (xhr.status === 200) {
        // success: empty error obj
        this.setState({ errors: {} })

        // set a message
        window.localStorage.setItem('successMessage', xhr.response.message)

        // make a redirect
        this.context.router.replace('/login')
      } else {
        // failure: error handling
        const errors = xhr.response.errors ? xhr.response.errors : {} // error details
        errors.summary = xhr.response.message   // error message

        this.setState({ errors })
      }
    })
    xhr.send(formData)
  }

  /**
   * Render the component.
   */
  render () {
    return (
      <SignUpForm
        onSubmit={this.processForm}
        onChange={this.changeUser}
        errors={this.state.errors}
        user={this.state.user}
      />
    )
  }
}

// get router context
SignUpPage.contextTypes = {
  router: PropTypes.object.isRequired
}

export default SignUpPage
