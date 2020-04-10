// @flow
import React from 'react';
import ButtonTransaction from 'component/common/transaction-link';
import CreditAmount from 'component/common/credit-amount';
import DateTime from 'component/dateTime';
import Button from 'component/button';
import { buildURI, parseURI } from 'lbry-redux';

type Props = {
  transaction: Transaction,
  reward: ?{
    reward_title: string,
  },
};

class TransactionListItem extends React.PureComponent<Props> {
  capitalize = (string: ?string) => string && string.charAt(0).toUpperCase() + string.slice(1);

  render() {
    const { reward, transaction } = this.props;

    const { amount, claim_id: claimId, claim_name: txListName, date, txid, type, fee } = transaction;

    const name = txListName;

    // Ensure the claim name exists and is valid
    let uri;
    let claimName;
    try {
      if (name.startsWith('@')) {
        ({ claimName } = parseURI(name));
        uri = buildURI({ channelName: claimName, channelClaimId: claimId });
      } else {
        ({ claimName } = parseURI(name));
        uri = buildURI({ streamName: claimName, streamClaimId: claimId });
      }
    } catch (e) {}

    const dateFormat = {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    };

    const forClaim = name && claimId;

    return (
      <tr>
        <td>
          {date ? (
            <div>
              <DateTime date={date} show={DateTime.SHOW_DATE} formatOptions={dateFormat} />
              <div className="table__item-label">
                <DateTime date={date} show={DateTime.SHOW_TIME} />
              </div>
            </div>
          ) : (
            <span className="empty">{__('Pending')}</span>
          )}
        </td>
        <td className="table__item--actionable">
          <span>{this.capitalize(type)}</span>{' '}
        </td>
        <td>
          {forClaim && <Button button="link" navigate={uri} label={claimName} disabled={!date} />}
          {!forClaim && reward && <span>{reward.reward_title}</span>}
        </td>

        <td>
          <ButtonTransaction id={txid} />
        </td>
        <td className="table__item--align-right">
          <CreditAmount badge={false} showPlus amount={amount} precision={8} />
          <br />

          {fee && fee !== 0 && (
            <span className="table__item-label">
              <CreditAmount badge={false} fee amount={fee} precision={8} />
            </span>
          )}
        </td>
      </tr>
    );
  }
}

export default TransactionListItem;
