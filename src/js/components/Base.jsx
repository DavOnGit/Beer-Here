import { PropTypes, default as React } from 'react'
import { Link, IndexLink } from 'react-router'

import Auth from '../modules/Auth'

const Base = ({ children }) => (
  <div className='container'>
    <div className='top-bar'>
      <div className='top-bar-left'>
        <IndexLink to='/'>Beer Here</IndexLink>
      </div>

      {Auth.isUserAuthenticated() ? (
        <div className='top-bar-right'>
          <Link to='/logout'>Log out</Link>
        </div>
      ) : (
        <div className='top-bar-right'>
          <Link to='/login'>Log in</Link>
          <Link to='/signup'>Sign up</Link>
        </div>
      )}

    </div>
    {children}
    <div className='footer'>
      <p><small>Search results powerd by <a href='https://www.yelp.com/' target='_blank'>Yelp</a></small></p>
    </div>
  </div>
)

Base.propTypes = {
  children: PropTypes.object.isRequired
}

export default Base
