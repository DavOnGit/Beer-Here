import React from 'react'
import { Card } from 'material-ui/Card'
import { GridList, GridTile } from 'material-ui/GridList'
import TextField from 'material-ui/TextField'
import RaisedButton from 'material-ui/RaisedButton'
import FlatButton from 'material-ui/FlatButton'
import Subheader from 'material-ui/Subheader'
import SearchIcon from 'material-ui/svg-icons/action/search'
import IconButton from 'material-ui/IconButton'
import GroupIcon from 'material-ui/svg-icons/social/group'
import PersonAddIcon from 'material-ui/svg-icons/social/person-add'

const styles = {
  root: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-around'
  },
  gridList: {
    width: '100%',
    height: 'auto',
    overflowY: 'auto'
  }
}

const HomeView = ({
  handleSearch,
  searchValue,
  handleSubmit,
  bizList,
  usersToBiz,
  isFetching,
  addUserToBiz,
  wipeUserFromBiz,
  error,
  gridCol
}) => {
  const addToBiz = bizId => () => isFetching ? null : addUserToBiz(bizId)
  const wipeFromBiz = bizId => () => isFetching ? null : wipeUserFromBiz(bizId)

  return (
    <Card>
      <div className='header'>
        <h1>Beer Here</h1>
        <h3>Find Breweries & Join your beer friends</h3>
      </div>
      <form className='serch-form' onSubmit={handleSubmit}>
        <div className='field-line'>
          <TextField
            floatingLabelText='Your location'
            value={searchValue}
            onChange={handleSearch}
            errorText={error}
            required='true'
            autoFocus='true'
          />
        </div>
        <RaisedButton primary
          label='Search now'
          type='submit'
          icon={<SearchIcon />}
          disabled={isFetching}
        />
      </form>
      {bizList && bizList.length !== 0 ? (
        <div style={styles.root}>
          <GridList className='grid-list'
            cols={gridCol}
            cellHeight={gridCol === 3 ? 234 : gridCol === 2 ? 275 : 300}
            style={styles.gridList}
          >
            <Subheader className='sub'><h2>Breweries found: {bizList.length}</h2></Subheader>
            {bizList.map((biz, idx) => (
              <GridTile className='imgTile'
                title={
                  <FlatButton className='link-btn'
                    href={biz.url}
                    target='_blank'
                    label={biz.name}
                    disabled={biz.is_closed}
                  />
                }
                key={idx}
                subtitle={
                  <div className='subtitle'>
                    {biz.is_closed ? '' : !usersToBiz || usersToBiz.length === 0 ? ''
                      : usersToBiz.some(el => biz.id === el.bizid) ? <GroupIcon color='#26C6DA' /> : ''}
                    {
                      biz.is_closed ? <span><b>Closed</b></span>
                      : usersToBiz
                      ? usersToBiz.map((data, idx) => {
                        if (biz.id === data.bizid) {
                          return <span key={idx}>{data.user.name}&nbsp;</span>
                        }
                        return ''
                      })
                      : null
                    }
                  </div>
                }
                titleBackground='linear-gradient(to top, rgba(0,0,0,0.7) 0%,rgba(0,0,0,0.3) 70%,rgba(0,0,0,0) 100%)'
                actionIcon={biz.is_closed ? null : (
                  <IconButton tooltip='Add or Remove this location'
                    tooltipPosition={'top-left'} touch={gridCol !== 3}>
                    {
                      !usersToBiz
                        ? <PersonAddIcon color='white' onClick={addToBiz(biz.id)} />
                      : usersToBiz.some((data) => biz.id === data.bizid && typeof data.user.email === 'string')
                        ? <PersonAddIcon color='#FF4081' onClick={wipeFromBiz(biz.id)} />
                      : <PersonAddIcon color='white' onClick={addToBiz(biz.id)} />
                    }
                  </IconButton>
                )}
              >
                <img src={biz.image_url} />
              </GridTile>
            ))}
          </GridList>
        </div>
      ) : null}
    </Card>
  )
}

export default HomeView
