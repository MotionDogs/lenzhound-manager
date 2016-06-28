'use strict';

var React = require('react');
var ReactDOM = require('react-dom');
var RaisedButton = require('material-ui/lib/raised-button');
var FlatButton = require('material-ui/lib/flat-button');
var Dialog = require('material-ui/lib/dialog');
var LensProfile = require('./lens-profile');
var LensProfileEditor = require('./lens-profile-editor');

module.exports = React.createClass({
    propTypes: {
        profiles: React.PropTypes.array
    },

    getInitialState: function getInitialState() {
        return { modalIsOpen: false };
    },
    modalOpen: function modalOpen() {
        this.setState({ modalIsOpen: true });
    },
    modalClose: function modalClose() {
        this.setState({ modalIsOpen: false });
    },
    render: function render() {
        var profiles = this.props.profiles;


        var styles = {
            outerDiv: {
                textAlign: 'center'
            },
            createButtonWrapper: {
                margin: '16px',
                display: 'inline-block'
            }
        };

        var modalActions = [React.createElement(FlatButton, {
            label: 'Cancel',
            primary: true,
            onMouseDown: this.modalClose
        }), React.createElement(FlatButton, {
            label: 'Submit',
            primary: true,
            disabled: true,
            onMouseDown: this.modalClose
        })];

        return React.createElement(
            'div',
            { style: styles.outerDiv },
            profiles.map(function (p) {
                return React.createElement(LensProfile, p);
            }),
            React.createElement(
                'div',
                { style: styles.createButtonWrapper },
                React.createElement(RaisedButton, {
                    label: 'Create a Lenzhound Profile',
                    primary: true,
                    onMouseDown: this.modalOpen })
            ),
            React.createElement(
                Dialog,
                {
                    title: 'Create Profile',
                    actions: modalActions,
                    modal: true,
                    open: this.state.modalIsOpen },
                React.createElement(LensProfileEditor, null)
            )
        );
    }
});