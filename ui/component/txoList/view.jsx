// @flow
import React, { useEffect } from 'react';
import { withRouter } from 'react-router';

import { TX_LIST } from 'lbry-redux';
import * as PAGES from 'constants/pages';
import * as TXO from 'constants/txo_list';

import TransactionListTable from 'component/transactionListTable';
import Paginate from 'component/common/paginate';
// import FileExporter from '../common/file-exporter'; // reimplement as modal
import { FormField } from '../common/form-components/form-field';
import Button from '../button';
import Card from '../common/card';
import { toCapitalCase } from '../../util/string';

type Props = {
  search: string,
  history: { action: string, push: string => void, replace: string => void },
  transactionPage: Array<Transaction>,
  transactionPageNumber: string,
  transactionItemCount: number,
  fetchTransactionPage: any => void,
};

type Delta = {
  dkey: string,
  value: string,
};

function TxoList(props: Props) {
  const { search, transactionPage, transactionItemCount, fetchTransactionPage, history } = props;

  // parse urlParams
  const urlParams = new URLSearchParams(search);
  const page = urlParams.get(TXO.PAGE) || String(1);
  const pageSize = urlParams.get(TXO.PAGE_SIZE) || String(TX_LIST.PAGE_SIZE);
  const type = urlParams.get(TXO.TYPE);
  const subtype = urlParams.get(TXO.SUB_TYPE);
  const active = urlParams.get(TXO.ACTIVE) || TXO.ACTIVE;

  const currentUrlParams = {
    page,
    pageSize,
    active,
    type,
    subtype,
  };

  // build new json params
  const params = {};

  if (currentUrlParams.type) {
    if (currentUrlParams.type === TXO.SENT) {
      params[TXO.IS_MY_INPUT] = true;
      params[TXO.IS_NOT_MY_OUTPUT] = true;
      if (currentUrlParams.subtype === TXO.TIP) {
        params[TXO.TX_TYPE] = TXO.SUPPORT;
      } else if (currentUrlParams.subtype === TXO.PURCHASE) {
        params[TXO.TX_TYPE] = TXO.PURCHASE;
      } else if (currentUrlParams.subtype === TXO.PURCHASE) {
        params[TXO.TX_TYPE] = TXO.OTHER;
      } else {
        params[TXO.TX_TYPE] = [TXO.OTHER, TXO.PURCHASE, TXO.SUPPORT];
      }
    } else if (currentUrlParams.type === TXO.RECEIVED) {
      params[TXO.IS_MY_OUTPUT] = true;
      params[TXO.IS_NOT_MY_INPUT] = true;
      if (currentUrlParams.subtype === TXO.TIP) {
        params[TXO.TX_TYPE] = TXO.SUPPORT;
      } else if (currentUrlParams.subtype === TXO.PURCHASE) {
        params[TXO.TX_TYPE] = TXO.PURCHASE;
      } else if (currentUrlParams.subtype === TXO.PURCHASE) {
        params[TXO.TX_TYPE] = TXO.OTHER;
      } else {
        params[TXO.TX_TYPE] = [TXO.OTHER, TXO.PURCHASE, TXO.SUPPORT];
      }
    } else if (currentUrlParams.type === TXO.SUPPORT) {
      params[TXO.TX_TYPE] = TXO.SUPPORT;
      params[TXO.IS_MY_INPUT] = true;
      params[TXO.IS_MY_OUTPUT] = true;
    } else if (currentUrlParams.type === TXO.CHANNEL || currentUrlParams.type === TXO.REPOST) {
      params[TXO.TX_TYPE] = currentUrlParams.type;
    } else if (currentUrlParams.type === TXO.PUBLISH) {
      params[TXO.TX_TYPE] = TXO.STREAM;
    }
  }

  if (currentUrlParams.active) {
    if (currentUrlParams.active === 'spent') {
      params[TXO.IS_SPENT] = true;
    } else if (currentUrlParams.active === 'active') {
      params[TXO.IS_NOT_SPENT] = true;
    }
  }

  if (currentUrlParams.page) params[TXO.PAGE] = Number(page);
  if (currentUrlParams.pageSize) params[TXO.PAGE_SIZE] = Number(pageSize);

  function handleChange(delta: Delta) {
    const url = updateUrl(delta);
    history.push(url);
  }

  function updateUrl(delta: Delta) {
    const newUrlParams = new URLSearchParams();
    switch (delta.dkey) {
      case TXO.PAGE:
        if (currentUrlParams.type) {
          newUrlParams.set(TXO.TYPE, currentUrlParams.type);
        }
        if (currentUrlParams.subtype) {
          newUrlParams.set(TXO.SUB_TYPE, currentUrlParams.subtype);
        }
        if (currentUrlParams.active) {
          newUrlParams.set(TXO.ACTIVE, currentUrlParams.active);
        }
        newUrlParams.set(TXO.PAGE, delta.value);
        break;
      case TXO.TYPE:
        newUrlParams.set(TXO.TYPE, delta.value);
        if (delta.value === TXO.SENT || delta.value === TXO.RECEIVED) {
          if (currentUrlParams.subtype) {
            newUrlParams.set(TXO.SUB_TYPE, currentUrlParams.subtype);
          } else {
            newUrlParams.set(TXO.SUB_TYPE, 'all');
          }
        }
        if (currentUrlParams.active) {
          newUrlParams.set(TXO.ACTIVE, currentUrlParams.active);
        }
        newUrlParams.set(TXO.PAGE, String(1));
        newUrlParams.set(TXO.PAGE_SIZE, currentUrlParams.pageSize);
        break;
      case TXO.SUB_TYPE:
        if (currentUrlParams.type) {
          newUrlParams.set(TXO.TYPE, currentUrlParams.type);
        }
        if (currentUrlParams.active) {
          newUrlParams.set(TXO.ACTIVE, currentUrlParams.active);
        }
        newUrlParams.set(TXO.SUB_TYPE, delta.value);
        newUrlParams.set(TXO.PAGE, String(1));
        newUrlParams.set(TXO.PAGE_SIZE, currentUrlParams.pageSize);
        break;
      case TXO.ACTIVE:
        if (currentUrlParams.type) {
          newUrlParams.set(TXO.TYPE, currentUrlParams.type);
        }
        if (currentUrlParams.subtype) {
          newUrlParams.set(TXO.SUB_TYPE, currentUrlParams.subtype);
        }
        newUrlParams.set(TXO.ACTIVE, delta.value);
        newUrlParams.set(TXO.PAGE, String(1));
        newUrlParams.set(TXO.PAGE_SIZE, currentUrlParams.pageSize);
        break;
    }
    return `?${newUrlParams.toString()}`;
  }

  const paramsString = JSON.stringify(params);

  useEffect(() => {
    if (paramsString && fetchTransactionPage) {
      const params = JSON.parse(paramsString);
      fetchTransactionPage(params);
    }
  }, [paramsString, fetchTransactionPage]);

  return (
    <Card
      title={__(`Transactions`)}
      titleActions={
        <div className="card__actions--inline">
          <Button button="secondary" label={__('Refresh')} onClick={() => fetchTransactionPage(params)} />
          {/* @if TARGET='app' */}
          <Button button="primary" navigate={`/$/${PAGES.TRANSACTIONS}`} label={__('Full History')} />
          {/* @endif */}
        </div>
      }
      headerActions={
        <div className="card__actions--between">
          <div>
            <div className="card__actions">
              {/* show the main drop down */}
              <div>
                <FormField
                  type="select"
                  name="type"
                  label={__('Type')}
                  value={type || 'all'}
                  onChange={e => handleChange({ dkey: TXO.TYPE, value: e.target.value })}
                >
                  {Object.values(TXO.DROPDOWN_TYPES).map(v => {
                    const stringV = String(v);
                    return (
                      <option key={stringV} value={stringV}>
                        {stringV && __(toCapitalCase(stringV))}
                      </option>
                    );
                  })}
                </FormField>
              </div>
              {/* show the subtypes drop down */}
              {(type === TXO.SENT || type === TXO.RECEIVED) && (
                <div>
                  <FormField
                    type="select"
                    name="subtype"
                    label={__('Payment Type')}
                    value={subtype || 'all'}
                    onChange={e => handleChange({ dkey: TXO.SUB_TYPE, value: e.target.value })}
                  >
                    {Object.values(TXO.DROPDOWN_SUBTYPES).map(v => {
                      const stringV = String(v);
                      return (
                        <option key={stringV} value={stringV}>
                          {stringV && __(toCapitalCase(stringV))}
                        </option>
                      );
                    })}
                  </FormField>
                </div>
              )}
            </div>
          </div>
          {/* show active/spent */}
          <div>
            <FormField
              type="radio"
              name="active"
              checked={active === TXO.ACTIVE}
              onChange={e => handleChange({ dkey: TXO.ACTIVE, value: 'active' })}
              label={__(toCapitalCase('active'))}
            />
            <FormField
              type="radio"
              name="spent"
              checked={active === 'spent'}
              onChange={e => handleChange({ dkey: TXO.ACTIVE, value: 'spent' })}
              label={__(toCapitalCase('historical'))}
            />
            <FormField
              type="radio"
              name="all"
              checked={active === 'all'}
              onChange={e => handleChange({ dkey: TXO.ACTIVE, value: 'all' })}
              label={__(toCapitalCase('all'))}
            />
          </div>
        </div>
      }
      body={
        <div>
          <Paginate totalPages={Math.ceil(transactionItemCount / Number(pageSize))} />
          <TransactionListTable txos={transactionPage} />
          <Paginate totalPages={Math.ceil(transactionItemCount / Number(pageSize))} />
        </div>
      }
    />
  );
}

export default withRouter(TxoList);
