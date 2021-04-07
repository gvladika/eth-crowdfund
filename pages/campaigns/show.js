import React, { Component } from "react";
import Campaign from "../../ethereum/campaign";
import Layout from "../../components/Layout";
import { Button, Card, Grid } from "semantic-ui-react";
import web3 from "../../ethereum/web3";
import ContributeForm from "../../components/ContributeForm";
import { Link } from "../../routes";

class CampaignShow extends Component {
  static async getInitialProps(props) {
    const campaign = Campaign(props.query.address);

    const summary = await campaign.methods.getSummary().call();
    console.log(summary);

    return {
      address: props.query.address,
      minimumContribution: summary[0],
      balance: summary[1],
      reqCount: summary[2],
      approversCount: summary[3],
      manager: summary[4],
    };
  }

  renderCards() {
    const {
      balance,
      manager,
      minimumContribution,
      reqCount,
      approversCount,
    } = this.props;

    const items = [
      {
        header: manager,
        meta: "Campaing manager address",
        description:
          "manager is campaign creator who can create request to withdraw money",
        style: { overflowWrap: "break-word" },
      },
      {
        header: minimumContribution,
        meta: "Minimum contribution",
        description: "Minimum amount of wei needed to fund the campaign",
        style: { overflowWrap: "break-word" },
      },
      {
        header: reqCount,
        meta: "Number of requests",
        description:
          "If approved by contributors, request moves funds to external address",
        style: { overflowWrap: "break-word" },
      },
      {
        header: approversCount,
        meta: "Number of approvers",
        description: "Number of people who already contributed",
        style: { overflowWrap: "break-word" },
      },
      {
        header: web3.utils.fromWei(balance, "ether"),
        meta: "campaign balance in wei",
        description: "Amount of funds campaign has left to spend",
        style: { overflowWrap: "break-word" },
      },
    ];

    return <Card.Group items={items}></Card.Group>;
  }

  render() {
    return (
      <Layout>
        <Grid>
          <Grid.Row>
            <Grid.Column width={10}>{this.renderCards()}</Grid.Column>
            <Grid.Column width={6}>
              <ContributeForm address={this.props.address}></ContributeForm>
            </Grid.Column>
          </Grid.Row>
          <Grid.Row>
            <Grid.Column>
              <Link route={`/campaigns/${this.props.address}/requests`}>
                <a>
                  <Button primary>View requests</Button>
                </a>
              </Link>
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </Layout>
    );
  }
}

export default CampaignShow;
