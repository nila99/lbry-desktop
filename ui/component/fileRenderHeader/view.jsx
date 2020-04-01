// @flow
import * as PAGES from 'constants/pages';
import * as CS from 'constants/claim_search';
import React from 'react';
import ClaimUri from 'component/claimUri';
import Button from 'component/button';

type Props = {
  uri: string,
  claim: ?Claim,
};

function FileRenderHeader(props: Props) {
  const { uri, claim } = props;

  return (
    <div className="file-render__header">
      <ClaimUri uri={uri} />

      {claim && claim.meta.reposted > 0 && (
        <Button
          button="link"
          className="media__uri--right"
          label={__('View reposts')}
          navigate={`/$/${PAGES.DISCOVER}?${CS.REPOSTED_URI_KEY}=${encodeURIComponent(uri)}`}
        />
      )}
    </div>
  );
}

export default FileRenderHeader;