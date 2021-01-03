class ZMsgManager {
    _defaultZMessage = null;
    register(_ref) {
      if (!this._defaultZMessage && "_id" in _ref) {
        this._defaultZMessage = _ref;
      }
    }
    unregister(_ref) {
      if (!!this._defaultZMessage && this._defaultZMessage._id === _ref._id) {
        this._defaultZMessage = null;
      }
    }
    getDefault() {
      return this._defaultZMessage;
    }
  }
  
  export default new ZMsgManager();
  
