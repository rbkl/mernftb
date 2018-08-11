import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { getCurrentProfile, deleteAccount } from '../../actions/profileActions';
import Spinner from '../common/Spinner';
import ProfileActions from './ProfileActions';
import Experience from './Experience';
import Education from './Education';

class Dashboard extends Component {
  componentDidMount() {
    this.props.getCurrentProfile();
  }

  onDeleteClick(e) {
    this.props.deleteAccount();
  }

  render() {
    const user = this.props.auth.user;
    const profile = this.props.profile.profile;
    const loading = this.props.profile.loading;

    let dashboardContent;

    if(profile === null || loading) {
      dashboardContent = <Spinner />
    } else {
      if(Object.keys(profile).length > 0) {
        // Profile exists, display the profile
        dashboardContent = (
          <div>
            <p className="lead text-muted">Welcome<Link to={`/profile/${profile.handle}`} > { user.name } </Link></p>
            <ProfileActions />
            <Experience experience={profile.experience}/>
            <Education education={profile.education}/>
            <div style={{ marginBottom: '60px'}} />
            <button className="btn btn-danger" onClick={this.onDeleteClick.bind(this)}>Delete my account</button>
          </div>
        );
      } else {
        // Profile does not exist, show link to create a profile
        dashboardContent = (
          <div>
            <p className="lead text-muted">Welcome { user.name }</p>
            <p>You have not yet setup a profile, please add some info</p>
            <Link to="/create-profile" className="btn btn-lg btn-info">
              Create a profile
            </Link>
          </div>
        );
        // <h4>TODO: LINK TO CREATE PROFILE</h4>
      }
    }

    return (
      <div className="dashboard">
        <div className="container">
          <div className="row">
            <div className="col-md-12">
              <h1 className="display-4">Dashboard</h1>
              {dashboardContent}
            </div>
          </div>
        </div>
      </div>
    )
  }
}

Dashboard.propTypes = {
  getCurrentProfile: PropTypes.func.isRequired,
  deleteAccount: PropTypes.func.isRequired,
  auth: PropTypes.object.isRequired,
  profile: PropTypes.object.isRequired,
}


const mapStateToProps = state => ({
  profile: state.profile,
  auth: state.auth,
})

export default connect(mapStateToProps, { getCurrentProfile, deleteAccount })(Dashboard);
