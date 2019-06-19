import React, { Fragment } from "react";
import classNames from "classnames";
import truncateMiddle from "truncate-middle";
import { getClusterType } from "@src/utilities/utilities";

import "@src/scss/components/watches/WatchVersionHistory.scss";

export default function WatchVersionHistory(props) {
  const { watch } = props;

  // Sanity check for null watches
  if (!watch) {
    return null;
  }

  const { currentVersion, watches, pastVersions } = watch;

  return (
    <div className="centered-container flex-column u-position--relative u-overflow--auto">
      <div className="flex alignItems--center u-borderBottom--gray u-paddingBottom--5">
        <p className="u-fontSize--header u-fontWeight--bold u-color--tuna">
          {currentVersion?.title}
        </p>
        <div className="icon checkmark-icon flex-auto u-marginLeft--10 u-marginRight--5"></div>
        <p className="u-fontSize--large">Most recent version</p>
        <div className="flex flex1 justifyContent--flexEnd">
          {watches?.length > 0 && (
            <Fragment>
              {watches.map(({ cluster }) => {
                const icon = getClusterType(cluster.gitOpsRef) === "git"
                  ? "icon github-small-size"
                  : "icon ship-small-size";

                return (
                  <div key={cluster.slug} className="watch-cell flex">
                    <div className="flex flex1 cluster-cell-title justifyContent--center alignItems--center u-fontWeight--bold u-color--tuna">
                      <span className={classNames(icon, "flex-auto u-marginRight--5")} />
                      <p className="u-fontSize--small u-fontWeight--medium u-color--tuna">
                        {truncateMiddle(cluster.slug, 8, 6, "...")}
                      </p>
                    </div>
                  </div>
                );
              })}
            </Fragment>
          )}
        </div>
      </div>
      <div className="flex-column">
        {pastVersions.length > 0 && pastVersions.map( version => {
          return (
            <div
              key={version.title}
              className="flex u-paddingTop--20 u-paddingBottom--20 u-borderBottom--gray">
              <div className="flex alignItems--center u-fontSize--larger u-color--tuna u-fontWeight--bold u-marginLeft--10">
                Version {version.title}
                <span className="icon integration-card-icon-github u-marginRight--5 u-marginLeft--5" />
                <a
                  className="u-color--astral u-marginLeft--5"
                  href=""
                  target="_blank"
                  rel="norefeer nofollow">
                    #{version.pullrequestNumber}
                </a>
              </div>
              <div className="flex flex1 justifyContent--flexEnd alignItems--center">
                <div className="watch-cell">
                  <div className="flex justifyContent--center alignItems--center">
                    <div className="icon checkmark-icon"></div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}