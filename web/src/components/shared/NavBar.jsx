import React, { PureComponent } from "react";
import PropTypes from "prop-types";
import classNames from "classnames";
import { Link, withRouter } from "react-router-dom";
import { compose, withApollo, graphql } from "react-apollo";

import { Utilities } from "@src/utilities/utilities";
import { userFeatures } from "@src/queries/WatchQueries";
import { listClusters } from "@src/queries/ClusterQueries";
import { userInfo } from "@src/queries/UserQueries";
import { logout } from "@src/mutations/GitHubMutations";
import Avatar from "../shared/Avatar";

import "@src/scss/components/shared/NavBar.scss";

export class NavBar extends PureComponent {
  constructor() {
    super();
    this.state = {}
  }

  static propTypes = {
    refetchListApps: PropTypes.func.isRequired,
    history: PropTypes.object.isRequired
  }

  handleLogOut = async (e) => {
    e.preventDefault();
    await this.props.logout()
      .catch((err) => {
        console.log(err);
      })
    Utilities.logoutUser();
  }

  componentDidUpdate() {
    if (Utilities.isLoggedIn() && !this.state.user) {
      this.props.client.query({ query: userInfo })
        .then((res) => {
          this.setState({ user: res.data.userInfo });
        }).catch();
    }
  }

  componentDidMount() {
    if (Utilities.isLoggedIn()) {
      this.props.client.query({ query: userInfo })
        .then((res) => {
          this.setState({ user: res.data.userInfo });
        }).catch();
    }
  }

  handleGoToClusters = () => {
    if (this.props.location.pathname === "/clusters") {
      this.props.client.query({
        query: listClusters,
        fetchPolicy: "network-only",
      });
    } else {
      this.props.history.push("/clusters");
    }
  }

  handleGoToTeams = () => {
    console.log("to be implemented")
  }

  handleAddNewApplication = () => {
    this.props.history.push("/watch/create/init");
  }

  redirectToDashboard = () => {
    const { refetchListApps, history } = this.props;
    refetchListApps().then(() => {
      history.push("/");
    });
  }

  render() {
    const { className, logo, defaultKotsAppIcon, fetchingMetadata } = this.props;
    const { user } = this.state;

    const isClusterScope = this.props.location.pathname.includes("/clusterscope");
    const isKotsApp = this.props.location.pathname.startsWith("/app");
    let navBarIcon = "";

    // If iconUri is set, display
    if (logo) {
      navBarIcon = <span className="watch-logo clickable" style={{ backgroundImage: `url(${navBarIcon})` }} />;

    // No icon but fetching metadata, show blank element
    } else if (fetchingMetadata) {
      navBarIcon = <span style={{ width: "30px", height: "30px" }} />
    }

    // No icon, but is a kots app? - display defaultKotsIcon
    else if (isKotsApp) {
      navBarIcon = <span className="watch-logo clickable" style={{ backgroundImage: `url(${defaultKotsAppIcon})` }} />;
    }

    return (
      <div className={classNames("NavBarWrapper flex flex-auto", className, {
        "cluster-scope": isClusterScope
      })}>
        <div className="container flex flex1">
          <div className="flex1 justifyContent--flexStart">
            <div className="flex1 flex u-height--full">
              <div className="flex flex-auto">
                <div className="flex alignItems--center flex1 flex-verticalCenter u-position--relative u-marginRight--20">
                  <div className="HeaderLogo">
                    <Link to={isClusterScope ? "/clusterscope" : "/"} tabIndex="-1">
                      {navBarIcon}
                    </Link>
                  </div>
                </div>
                {Utilities.isLoggedIn() && (
                  <div className="flex flex-auto left-items">
                    <div className="NavItem u-position--relative flex">
                      <span className="HeaderLink flex flex1 u-cursor--pointer" onClick={this.redirectToDashboard}>
                        <span className="text u-fontSize--normal u-fontWeight--medium flex-column justifyContent--center">
                          <span>Dashboard</span>
                        </span>
                      </span>
                    </div>
                    <div className="NavItem u-position--relative flex">
                      <span className="HeaderLink flex flex1 u-cursor--pointer" onClick={this.handleGoToClusters}>
                        <span className="text u-fontSize--normal u-fontWeight--medium flex-column justifyContent--center">
                          <span>Clusters</span>
                        </span>
                      </span>
                    </div>
                    {/* <div className="NavItem u-position--relative flex ${clustersEnabled">
                      <span className="HeaderLink flex flex1 u-cursor--pointer" onClick={this.handleGoToTeams}>
                        <span className="text u-fontSize--normal u-fontWeight--medium flex-column justifyContent--center">
                          <span>Teams</span>
                        </span>
                      </span>
                    </div> */}
                  </div>
                  )
                }
              </div>
              {Utilities.isLoggedIn() ?
                <div className="flex flex1 justifyContent--flexEnd right-items">
                  <div className="flex-column flex-auto u-marginRight--20 justifyContent--center">
                    <Link className="btn secondary green rounded" to="/watch/create/init">
                      Add a new application
                    </Link>
                  </div>
                  <div className="flex-column flex-auto justifyContent--center">
                    <p data-qa="Navbar--logOutButton" className="NavItem" onClick={this.handleLogOut}>Log out</p>
                  </div>
                  {user && user.avatarUrl !== "" ?
                    <div className="flex-column flex-auto justifyContent--center u-marginLeft--10">
                      <Avatar imageUrl={this.state.user && this.state.user.avatarUrl} />
                    </div>
                  : null}
                </div>
                : null}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default compose(
  withRouter,
  withApollo,
  graphql(logout, {
    props: ({ mutate }) => ({
      logout: () => mutate()
    })
  }),
  graphql(userFeatures, {
    name: "userFeaturesQuery",
    skip: !Utilities.isLoggedIn()
  })
)(NavBar);
