import React, { PropTypes, Component } from 'react'
import { connect } from 'react-redux'

import HomeView from '../components/HomeView'
import Auth from '../modules/Auth'
import { startYelpFetching, startAddUserToBiz, startRemoveUserFromBiz } from '../actions/actions'

class HomePage extends Component {
  state = {
    search: '',
    error: undefined,
    gridCol: 1
  }

  updateWidth = () => {
    const width = window.innerWidth
    const gridCol = width < 768 ? 1 : width < 960 ? 2 : 3

    this.setState({ gridCol })
  }

  componentWillMount () {
    this.updateWidth()
  }

  componentDidMount () {
    window.addEventListener('resize', this.updateWidth)
  }

  handleSearch = (event) => {
    const search = event.target.value
    this.setState({ search, error: undefined })
  }

  handleSubmit = (event) => {
    event.preventDefault()
    const _search = this.state.search.trim()

    if (typeof _search !== 'string' || _search.length === 0 || _search.length > 40) {
      this.setState({error: 'error: invalid submission'})
    } else {
      this.props.dispatch(startYelpFetching(_search))
    }
  }

  handleAddUserToBiz = (bizId) => {
    if (!Auth.isUserAuthenticated()) {
      // Redirect to login
      this.context.router.replace('/login')
    } else this.props.dispatch(startAddUserToBiz(bizId))
  }

  handleRemoveUserFromBiz = (bizId) => {
    this.props.dispatch(startRemoveUserFromBiz(bizId))
  }

  render () {
    const { search, error, gridCol } = this.state
    const { yelpResults, isFetching } = this.props
    return (
      <HomeView searchValue={search}
        handleSearch={this.handleSearch}
        handleSubmit={this.handleSubmit}
        bizList={yelpResults.businesses}
        usersToBiz={yelpResults.userstobiz}
        addUserToBiz={this.handleAddUserToBiz}
        wipeUserFromBiz={this.handleRemoveUserFromBiz}
        isFetching={isFetching}
        error={error}
        gridCol={gridCol}
      />
    )
  }

  componentWillUnmount () {
    window.removeEventListener('resize', this.updateWidth)
  }
}

// get router context
HomePage.contextTypes = {
  router: PropTypes.object.isRequired
}

const mapStateToProps = (state) => {
  return {
    yelpResults: state.yelpResults,
    isFetching: state.fetching
  }
}

export default connect(
  mapStateToProps
)(HomePage)
