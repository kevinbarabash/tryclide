const React = require('react');

const { Component } = React;
const { connect } = require('react-redux');

const ContextMenu = require('./context-menu.js');
const store = require('./store.js');

class EditableListItem extends Component {
    state = {
        isEditing: false,
        value: this.props.value,
    };

    handleChange = (e) => {
        this.setState({ value: e.target.value });
    };

    handleClick = () => {
        this.setState({ isEditing: true });
    };

    handleKeyUp = (e) => {
        if (e.key === 'Enter') {
            if (this.props.value !== e.target.value) {
                this.setState({ isEditing: false });

                store.dispatch({
                    type: 'RENAME_FILE',
                    old_filename: this.props.value,
                    new_filename: e.target.value
                });
            }
        }
    };

    render() {
        const style = {
            position: 'relative',
            backgroundColor: this.props.selected ? '#999' : '',
            userSelect: 'none',
            WebkitUserSelect: 'none'
        };

        return <li
            onContextMenu={(e) => this.props.onContextMenu(e, this.state.value)}
            onDoubleClick={this.props.onDoubleClick}
            onClick={this.props.onClick}
            style={style}
        >
            {this.state.isEditing &&
                <input type="text" onChange={this.handleChange} onKeyUp={this.handleKeyUp} value={this.state.value} />}
            {!this.state.isEditing &&
                <span>{this.state.value}</span>}
        </li>
    }
}

class Browser extends Component {
    state = {
        contextMenu: null,
    };

    handleDoubleClick = (filename) => {
        store.dispatch({
            type: 'OPEN_FILE',
            filename: filename
        });
    };

    handleClick = (filename) => {
        store.dispatch({
            type: 'SELECT_FILE',
            filename: filename
        });
    };

    handleNewFile = () => {
        store.dispatch({
            type: 'NEW_FILE'
        });
    };

    handleContextMenu = (e, filename) => {
        e.preventDefault();

        store.dispatch({
            type: 'SELECT_FILE',
            filename: filename
        });

        store.dispatch({
            type: 'SHOW_CONTEXT_MENU',
            location: {
                x: e.pageX,
                y: e.pageY
            }
        });
    };

    render() {
        const style = {
            listStyleType: 'none',
            width: 150,
            margin: 0,
            padding: 0,
            overflow: 'scroll',
            flexGrow: 1
        };

        const containerStyle = {
            display: 'flex',
            flexDirection: 'column',
            fontFamily: 'Lucida Grande',
            fontSize: 14,
        };

        const files = Object.keys(this.props.files);

        const { contextMenu } = this.props;

        return <div style={containerStyle} onClick={this.handleContainerClick}>
            <ul style={style}>
                {
                    files.map(filename =>
                        <EditableListItem
                            key={filename}
                            onClick={() => this.handleClick(filename)}
                            onDoubleClick={() => this.handleDoubleClick(filename)}
                            onContextMenu={this.handleContextMenu}
                            selected={filename === this.props.editor.selectedFile}
                            value={filename}
                        />)
                }
            </ul>
            <div>
                <span onClick={this.handleNewFile}>New file</span>
            </div>
            {contextMenu &&
                <ContextMenu
                    left={contextMenu.location.x}
                    top={contextMenu.location.y}
                />}
        </div>;
    }
}

module.exports = connect(state => state)(Browser);
