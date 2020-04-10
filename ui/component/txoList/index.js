import { connect } from 'react-redux';
import { doOpenModal } from 'redux/actions/app';
import {
  selectIsFetchingTransactions,
  selectFetchingTransactionsError,
  selectTransactionPage,
  selectTransactionPageNumber,
  selectTransactionItemCount,
  doFetchTransactionPage,
} from 'lbry-redux';
import { withRouter } from 'react-router';
import TxoList from './view';

const select = state => ({
  transactionFetchError: selectFetchingTransactionsError(state),
  transactionPage: selectTransactionPage(state),
  transactionPageNumber: selectTransactionPageNumber(state),
  transactionItemCount: selectTransactionItemCount(state),
  loading: selectIsFetchingTransactions(state),
});

const perform = dispatch => ({
  openModal: (modal, props) => dispatch(doOpenModal(modal, props)),
  fetchTransactionPage: params => dispatch(doFetchTransactionPage(params)),
});

export default withRouter(connect(select, perform)(TxoList));
