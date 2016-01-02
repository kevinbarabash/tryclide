const React = require('react');

const { Component } = React;
const { connect } = require('react-redux');


class Viewer extends Component {
    constructor() {
        super();
    }

    render() {
        const style = {
            width: 500,
            marginLeft: 5,
            marginTop: 33,
            border: 'none',
            background: 'white',
        };

        const html = this.props.files['index.html'];
        const css = this.props.files['styles.css'];
        const main = this.props.files['main.js'];

        const cssBlob = new Blob([css], { type: 'text/css'});
        const cssUrl = URL.createObjectURL(cssBlob);

        const mainBlob = new Blob([main], { type: 'text/javascript'});
        const mainUrl = URL.createObjectURL(mainBlob);

        const htmlBlob = new Blob([
            html.replace("style.css", cssUrl.toString()).replace("main.js", mainUrl.toString())
        ], { type: 'text/html'});
        const htmlUrl = URL.createObjectURL(htmlBlob);

        return <iframe style={style} src={htmlUrl}>

        </iframe>;
    }
}

module.exports = connect(state => {
    return {
        files: state.files
    };
})(Viewer);
