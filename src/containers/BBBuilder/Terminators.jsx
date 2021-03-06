import React, { Component } from "react"
import { connect } from "react-redux"
import { Redirect } from "react-router-dom"
import { terminatorsRef } from "../../config/firebase"
import { builderActions } from "../../actions"
//Components
import ColorCodes from "../../components/BBBuilder/ColorCodes"
import InfoBar from "../../components/BBBuilder/InfoBar"
import SampleStockStatus from "../../components/BBBuilder/SampleStockStatus"
import InputSequence from "../../components/BBBuilder/InputSequence"

//Table
import BootstrapTable from "react-bootstrap-table-next"
import paginationFactory from "react-bootstrap-table2-paginator"
import filterFactory, {
    textFilter,
    selectFilter
} from "react-bootstrap-table2-filter"

//Style
import "../../css/table.css"
import Container from "react-bootstrap/lib/Container"
import Row from "react-bootstrap/lib/Row"
import Col from "react-bootstrap/lib/Col"
import Button from "react-bootstrap/lib/Button"

const selectOptions = {
    Forward: "Forward",
    Reverse: "Reverse",
    Yeast: "Yeast"
}

const IN_STOCK = "In stock"
const NOT_IN_STOCK = "Not in stock"
const COMPLICATED = "It's complicated"
const ALL = "All"

const columns = [
    {
        dataField: "name",
        text: "Product Name",
        filter: textFilter(),
        sort: true,
        style: (cell, row, rowIndex, colIndex) => ({
            width: "20%"
        })
    },
    {
        dataField: "description",
        text: "Product Description",
        filter: textFilter(),
        sort: true,
        style: (cell, row, rowIndex, colIndex) => ({
            width: "30%"
        })
    },
    {
        dataField: "type",
        text: "Category",
        formatter: cell => selectOptions[cell],
        filter: selectFilter({
            options: selectOptions
        }),
        sort: true,
        style: (cell, row, rowIndex, colIndex) => ({
            width: "20%"
        })
    },
    {
        dataField: "forward",
        text: "Forward Efficiency",
        sort: true,
        style: (cell, row, rowIndex, colIndex) => ({
            width: "10%"
        })
    },
    {
        dataField: "reverse",
        text: "Reverse Efficiency",
        sort: true,
        style: (cell, row, rowIndex, colIndex) => ({
            width: "10%"
        })
    },
    {
        dataField: "status",
        text: "Product Status",
        hidden: true
    },
    {
        dataField: "link",
        isDummyField: true,
        text: "Link to iGEM",
        formatter: (cellContent, row) => {
            return (
                <Button
                    href={`http://parts.igem.org/Part:${row["name"]}`}
                    target="_blank"
                    variant="info">
                    Link to iGEM
                </Button>
            )
        },
        style: (cell, row, rowIndex, colIndex) => ({
            width: "10%"
        })
    }
]
const selectRow = {
    mode: "radio",
    clickToSelect: true,
    hideSelectColumn: true,
    bgColor: "#7dc9ff"
}
const paginationOptions = {
    showTotal: true,
    paginationTotalRenderer: (from, to, size) => (
        <span className="react-bootstrap-table-pagination-total">
            Showing {from} to {to} of {size} Results
        </span>
    )
}
class Terminator extends Component {
    constructor(props) {
        super(props)
        this.state = {
            status: "",
            payload: [],
            filteredPayload: [],
            selectedTerminator: "",
            typedTerminator: "",
            expanded: [],
            inLibrary: true
        }
        this.handleSelectStatus = this.handleSelectStatus.bind(this)
        this.handClickBack = this.handClickBack.bind(this)
        this.handleClickContinue = this.handleClickContinue.bind(this)
        this.toggleLibrary = this.toggleLibrary.bind(this)
        this.handleTypeSequence = this.handleTypeSequence.bind(this)
    }
    handleTypeSequence = value => {
        this.setState({ typedTerminator: value })
    }
    handClickBack = () => {
        const { history } = this.props
        history.push("/bbbuilder/codingsequence")
    }
    toggleLibrary = () => {
        const { inLibrary } = this.state
        if (inLibrary) {
            this.setState({
                inLibrary: !inLibrary,
                typedTerminator: "",
                selectedTerminator: "",
                expanded: []
            })
        } else {
            this.setState({
                inLibrary: !inLibrary,
                typedTerminator: "",
                selectedTerminator: "",
                expanded: []
            })
        }
    }
    getSequence = row => {
        builderActions
            .getSequence(row.name)
            .then(response => {
                this.setState({
                    filteredPayload: this.state.filteredPayload.map(val => {
                        if (val["name"] === row.name) {
                            val["sequence"] = response.data[
                                Object.keys(response.data)[0]
                            ].sequence
                                .replace(/\s/g, "")
                                .toUpperCase()
                        }
                        return val
                    })
                })
            })
            .catch(error => {
                console.log(error)
            })
    }
    handleClickContinue = () => {
        const { selectedTerminator, typedTerminator } = this.state
        const { dispatch } = this.props
        dispatch(
            builderActions.selectTerminator(
                selectedTerminator || typedTerminator
            )
        )
        const { history } = this.props
        history.push("/bbbuilder/resultbb")
    }

    handleSelectStatus = e => {
        const dataStatus = [ALL, IN_STOCK, NOT_IN_STOCK, COMPLICATED]
        let { rfc } = this.props.builder
        rfc = rfc.replace(/\s/g, "")
        this.setState({
            filteredPayload: this.state.payload.filter(val => {
                if (dataStatus[e] !== ALL) {
                    return (
                        val["status"] === dataStatus[e] &&
                        val["standards"].indexOf(rfc) > -1
                    )
                } else {
                    return val["standards"].indexOf(rfc) > -1
                }
            }),
            status: dataStatus[e]
        })
    }
    handleOnExpand = (row, isExpand, rowIndex, e) => {
        if (isExpand) {
            this.setState(() => ({
                selectedTerminator: row,
                expanded: [row.name]
            }))
        } else {
            this.setState(() => ({
                selectedTerminator: "",
                expanded: []
            }))
        }
    }
    rowStyle = (row, rowIndex) => {
        const style = {}
        if (row["status"] === IN_STOCK) {
            if (row.name === this.state.expanded[0]) {
                style.backgroundColor = "#9eca8d"
            } else {
                style.border = "2px solid #9eca8d"
            }
        } else if (row["status"] === NOT_IN_STOCK) {
            if (row.name === this.state.expanded[0]) {
                style.backgroundColor = "#f38484"
            } else {
                style.border = "2px solid #f38484"
            }
        } else if (row["status"] === COMPLICATED) {
            if (row.name === this.state.expanded[0]) {
                style.backgroundColor = "rgb(255, 217, 30)"
            } else {
                style.border = "2px solid rgb(255, 217, 30)"
            }
        }

        return style
    }
    componentDidMount() {
        let {
            builder: { rfc }
        } = this.props
        rfc = rfc.replace(/\s/g, "")
        terminatorsRef.on("value", snapshot => {
            this.setState(() => ({
                ...this.state,
                payload: snapshot.val(),
                filteredPayload: snapshot.val().filter(val => {
                    return val["standards"].indexOf(rfc) > -1
                })
            }))
        })
    }
    render() {
        const {
            filteredPayload,
            status,
            expanded,
            inLibrary,
            selectedTerminator,
            typedTerminator
        } = this.state
        const { rfc, chassis, promoter, sequence, rbs } = this.props.builder
        if (!rfc || !chassis) return <Redirect to="/bbbuilder" />
        if (!promoter) return <Redirect to="/bbbuilder/promoter" />
        if (!rbs) return <Redirect to="/bbbuilder/rbs" />
        if (!sequence) return <Redirect to="/bbbuilder/codingsequence" />
        const expandRow = {
            renderer: row => (
                <div className="wrapper">
                    <div className="content">
                        <p>Sample status: {`${row["status"]}`}</p>
                        <p>Compatible RFC standards: {`${row["standards"]}`}</p>
                        <p>Length: {`${row["length"]}`}</p>
                        <p>
                            <strong> Experience: </strong>
                            {isNaN(row["rating"])
                                ? `${row["rating"]}`
                                : `${row["rating"]} Star!!`}
                        </p>
                        <p>Forward Efficiency: {`${row["forward"]}`}</p>
                        <p>Reverse Efficiency: {`${row["reverse"]}`}</p>
                        {row["sequence"] && (
                            <p className="sequence">
                                <strong>Sequence: </strong>{" "}
                                {`${row["sequence"]}`}
                            </p>
                        )}
                        {!row["sequence"] && (
                            <Button onClick={() => this.getSequence(row)}>
                                Get Sequence
                            </Button>
                        )}
                    </div>
                    <div className="sidebar">
                        <Button
                            variant="success"
                            onClick={this.handleClickContinue}
                            disabled={selectedTerminator === ""}>
                            Select Terminator
                        </Button>
                    </div>
                </div>
            ),
            expanded: expanded,
            onExpand: this.handleOnExpand
        }
        return (
            <Container>
                <InfoBar
                    statusPosition={"Terminator"}
                    chassis={chassis}
                    rfc={rfc}
                    rbs={rbs.name ? rbs.name : rbs}
                    promoter={promoter.name ? promoter.name : promoter}
                    sequence={sequence}
                />
                <Row className="mb-2">
                    <Col className="d-flex justify-content-between">
                        <Button onClick={this.handClickBack}>
                            Go back to Coding Sequence selection
                        </Button>
                        <Button variant="warning" onClick={this.toggleLibrary}>
                            {inLibrary && "Insert your own sequence"}
                            {!inLibrary && "Select from the library"}
                        </Button>
                    </Col>
                </Row>
                {inLibrary && (
                    <React.Fragment>
                        <Row className="mb-4">
                            <ColorCodes />
                            <SampleStockStatus
                                val={status}
                                handler={this.handleSelectStatus}
                            />
                        </Row>
                        <Row>
                            <Col xs="12">
                                {filteredPayload && (
                                    <BootstrapTable
                                        keyField="name"
                                        columns={columns}
                                        data={filteredPayload}
                                        pagination={paginationFactory(
                                            paginationOptions
                                        )}
                                        filter={filterFactory()}
                                        bootstrap4={true}
                                        rowStyle={this.rowStyle}
                                        expandRow={expandRow}
                                        selectRow={selectRow}
                                    />
                                )}
                            </Col>
                        </Row>
                    </React.Fragment>
                )}
                {!inLibrary && (
                    <React.Fragment>
                        <InputSequence
                            val={typedTerminator}
                            handler={this.handleTypeSequence}
                        />
                        <Button
                            variant="success"
                            className="float-right"
                            onClick={this.handleClickContinue}
                            disabled={typedTerminator === ""}>
                            Select Terminator
                        </Button>
                    </React.Fragment>
                )}
            </Container>
        )
    }
}

const mapStateToProps = ({ builder }) => ({
    builder
})
export default connect(mapStateToProps)(Terminator)
