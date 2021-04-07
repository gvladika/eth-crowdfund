import React, { Component } from "react";
import Layout from "../../components/Layout";
import { Button, Form, Input, Message } from "semantic-ui-react";
import web3 from "../../ethereum/web3";
import factory from "../../ethereum/factory";
import { Router } from "../../routes";

class CampaignNew extends Component {
  state = {
    minContribution: "",
    errorMessage: "",
    loading: false,
  };

  onSubmit = async (event) => {
    event.preventDefault();

    this.setState({ loading: true, errorMessage: "" });

    try {
      const accounts = await web3.eth.getAccounts();
      await factory.methods
        .createCampaign(this.state.minContribution)
        .send({ from: accounts[0] });
        
      Router.pushRoute("/");
    } catch (err) {
      console.log(err.message);
      this.setState({ errorMessage: err.message });
    }

    this.setState({ loading: false });
  };

  render() {
    return (
      <Layout>
        <h1>Create new campaign!</h1>
        <Form onSubmit={this.onSubmit} error={!!this.state.errorMessage}>
          <Form.Field>
            <label>Minimum contribution in wei</label>
            <Input
              label="wei"
              labelPosition="right"
              value={this.state.minContribution}
              onChange={(event) =>
                this.setState({ minContribution: event.target.value })
              }
            />
          </Form.Field>
          <Message error header="Oops!" content={this.state.errorMessage} />
          <Button loading={this.state.loading} primary>
            Create
          </Button>
        </Form>
      </Layout>
    );
  }
}

export default CampaignNew;
