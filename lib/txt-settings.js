'use strict';

var React = require('react');
var MobileTearSheet = require('../../../MobileTearSheet');
var List = require('material-ui/lib/lists/list');
var ListItem = require('material-ui/lib/lists/list-item');
var ActionGrade = require('material-ui/lib/svg-icons/action/grade');
var ActionInfo = require('material-ui/lib/svg-icons/action/info');
var ContentInbox = require('material-ui/lib/svg-icons/content/inbox');
var ContentDrafts = require('material-ui/lib/svg-icons/content/drafts');
var ContentSend = require('material-ui/lib/svg-icons/content/send');
var Divider = require('material-ui/lib/divider');

module.exports = React.createClass({
    render: function render() {
        return React.createElement(
            MobileTearSheet,
            null,
            React.createElement(
                List,
                null,
                React.createElement(ListItem, { primaryText: 'Inbox', leftIcon: React.createElement(ContentInbox, null) }),
                React.createElement(ListItem, { primaryText: 'Starred', leftIcon: React.createElement(ActionGrade, null) }),
                React.createElement(ListItem, { primaryText: 'Sent mail', leftIcon: React.createElement(ContentSend, null) }),
                React.createElement(ListItem, { primaryText: 'Drafts', leftIcon: React.createElement(ContentDrafts, null) }),
                React.createElement(ListItem, { primaryText: 'Inbox', leftIcon: React.createElement(ContentInbox, null) })
            ),
            React.createElement(Divider, null),
            React.createElement(
                List,
                null,
                React.createElement(ListItem, { primaryText: 'All mail', rightIcon: React.createElement(ActionInfo, null) }),
                React.createElement(ListItem, { primaryText: 'Trash', rightIcon: React.createElement(ActionInfo, null) }),
                React.createElement(ListItem, { primaryText: 'Spam', rightIcon: React.createElement(ActionInfo, null) }),
                React.createElement(ListItem, { primaryText: 'Follow up', rightIcon: React.createElement(ActionInfo, null) })
            )
        );
    }
});
