const React = require('react');
const ReactDOM = require('react-dom');
const RaisedButton = require('material-ui/lib/raised-button');
const FlatButton = require('material-ui/lib/flat-button');
const Dialog = require('material-ui/lib/dialog');

const LensProfile = require('./lens-profile');
const LensProfileEditor = require('./lens-profile-editor');

module.exports = React.createClass({
    propTypes: {
        profiles: React.PropTypes.array
    },

    getInitialState() {
        return {modalIsOpen: false};
    },

    modalOpen() {
        this.setState({modalIsOpen: true});
    },

    modalClose() {
        this.setState({modalIsOpen: false});
    },

    render() {
        var {profiles} = this.props;

        var styles = {
            outerDiv: {
                textAlign: 'center',
            },
            createButtonWrapper: {
                margin: '16px',
                display: 'inline-block',
            },
        };

        const modalActions = [
          <FlatButton
            label="Cancel"
            primary={true}
            onMouseDown={this.modalClose}
          />,
          <FlatButton
            label="Submit"
            primary={true}
            disabled={true}
            onMouseDown={this.modalClose}
          />,
        ];

        return (
            <div style={styles.outerDiv}>
                {profiles.map(p => (<LensProfile {...p} />))}
                <div style={styles.createButtonWrapper}>
                    <RaisedButton
                        label="Create a Lenzhound Profile"
                        primary={true}
                        onMouseDown={this.modalOpen} />
                </div>
                <Dialog
                  title="Create Profile"
                  actions={modalActions}
                  modal={true}
                  open={this.state.modalIsOpen}>
                  <LensProfileEditor />
                </Dialog>
            </div>
        )
    }
});
