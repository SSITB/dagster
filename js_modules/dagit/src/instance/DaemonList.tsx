import {gql} from '@apollo/client';
import moment from 'moment-timezone';
import * as React from 'react';

import {PythonErrorInfo} from 'src/PythonErrorInfo';
import {browserTimezone, timestampToString} from 'src/TimeComponents';
import {DaemonHealth} from 'src/instance/DaemonHealth';
import {
  DaemonHealthFragment,
  DaemonHealthFragment_allDaemonStatuses as DaemonStatus,
} from 'src/instance/types/DaemonHealthFragment';
import {Table} from 'src/ui/Table';

interface DaemonLabelProps {
  daemon: DaemonStatus;
}

const DaemonLabel = (props: DaemonLabelProps) => {
  const {daemon} = props;
  switch (daemon.daemonType) {
    case 'SCHEDULER':
      return <div>Scheduler</div>;
    case 'SENSOR':
      return <div>Sensors</div>;
    case 'QUEUED_RUN_COORDINATOR':
      return <div>Run queue</div>;
    default:
      throw new Error('Unknown daemon type');
  }
};

interface Props {
  daemonHealth: DaemonHealthFragment | undefined;
}

export const DaemonList = (props: Props) => {
  const {daemonHealth} = props;

  if (!daemonHealth) {
    return null;
  }

  return (
    <Table striped style={{width: '100%'}}>
      <thead>
        <tr>
          <th style={{width: '15%'}}>Daemon</th>
          <th style={{width: '25%'}}>Status</th>
          <th>Last heartbeat</th>
        </tr>
      </thead>
      <tbody>
        {daemonHealth.allDaemonStatuses
          .filter((daemon) => daemon.required)
          .map((daemon) => {
            return (
              <tr key={daemon.daemonType}>
                <td>
                  <DaemonLabel daemon={daemon} />
                </td>
                <td>
                  <DaemonHealth daemon={daemon} />
                </td>
                <td>
                  {daemon.lastHeartbeatTime
                    ? `${timestampToString(
                        {unix: daemon.lastHeartbeatTime, format: 'YYYY-MM-DD HH:mm:ss z'},
                        browserTimezone(),
                      )} (${moment.unix(daemon.lastHeartbeatTime).fromNow()})`
                    : 'Never'}
                </td>
              </tr>
            );
          })}
      </tbody>
    </Table>
  );
};

export const DAEMON_HEALTH_FRAGMENT = gql`
  fragment DaemonHealthFragment on DaemonHealth {
    allDaemonStatuses {
      daemonType
      required
      healthy
      lastHeartbeatError {
        __typename
        ...PythonErrorFragment
      }
      lastHeartbeatTime
    }
  }
  ${PythonErrorInfo.fragments.PythonErrorFragment}
`;