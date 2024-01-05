import React, { useEffect, useState } from 'react';
import { GroupDetails } from './groupdetails';
import { GroupMembers } from './groupmembers';
import { Groupnews } from './groupnews';
import { IsGroupMember} from './auth';
import { useParams } from 'react-router-dom';
import { UsernameSignal } from './signals';

export const Communitypage = () => {

  const { groupname } = useParams(); // Get the groupname from the URL
  const [isMember, setIsMember] = useState(false);

  // Check if the user is a member of the group
  useEffect(() => {
    async function checkMembership() {
      const member = await IsGroupMember(groupname);
      setIsMember(member);
    }
    checkMembership();
  }, [UsernameSignal.value]);

  return (
    <div>
      {isMember ? (
        <>
          <GroupDetails />
          <GroupMembers />
          <Groupnews />
        </>
      ) : (
        <div>
            <img src='../pictures/user.png' />
            <p>Sinulla ei ole oikeutta nähdä tätä sisältöä!</p>
            <p>Ole hyvä ja kirjaudu sisään.</p>
            <p>Jos et vieläkään näe sisältöä, olethan varmistanut olevasi ryhmän jäsen</p>
        </div>
  
      )}
    </div>
  );
};
