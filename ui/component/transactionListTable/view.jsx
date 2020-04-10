// @flow
import * as MODALS from 'constants/modal_types';
import React from 'react';
import TransactionListItem from './internal/transaction-list-item';
import TxoListItem from './internal/txo-list-item';

type Props = {
  emptyMessage: ?string,
  loading: boolean,
  mySupports: {},
  myClaims: any,
  openModal: (id: string, { tx: Txo }) => void,
  rewards: {},
  transactions?: Array<Transaction>,
  txos?: Array<Txo>,
};

function TransactionListTable(props: Props) {
  const { emptyMessage, rewards, loading, txos, transactions } = props;
  const REVOCABLE = ['channel', 'stream', 'repost', 'support', 'claim'];
  const list = txos || transactions || [];
  function revokeClaim(tx: any) {
    props.openModal(MODALS.CONFIRM_CLAIM_REVOKE, { tx });
  }

  return (
    <React.Fragment>
      {!loading && !list.length && <h2 className="main--empty empty">{emptyMessage || __('No transactions.')}</h2>}
      {loading && <h2 className="main--empty empty">{__('Loading...')}</h2>}
      {!loading && !!list.length && (
        <div className="table__wrapper">
          <table className="table table--transactions">
            <thead>
              <tr>
                <th>{__('Date')}</th>
                <th>{__('Type')} </th>
                <th>{__('Details')} </th>
                <th>{__('Transaction')}</th>
                <th className="table__item--align-right">{__('Amount')}</th>
              </tr>
            </thead>
            <tbody>
              {transactions &&
                transactions.map((t, i) => (
                  <TransactionListItem
                    key={`${t.txid}:${t.nout}-${i}`}
                    transaction={t}
                    reward={rewards && rewards[t.txid]}
                  />
                ))}
              {txos &&
                txos.map((t, i) => (
                  <TxoListItem
                    key={`${t.txid}:${t.nout}-${i}`}
                    txo={t}
                    reward={rewards && rewards[t.txid]}
                    isRevokeable={t.is_my_output && !t.is_spent && REVOCABLE.includes(t.type)}
                    revokeClaim={revokeClaim}
                  />
                ))}
            </tbody>
          </table>
        </div>
      )}
    </React.Fragment>
  );
}

export default TransactionListTable;
