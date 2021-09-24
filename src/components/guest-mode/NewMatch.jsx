import React, { useState, useEffect } from "react";
import {
  Input,
  Space,
  Table,
  Button,
  message,
  Row,
  Col,
  Typography,
} from "antd";
import { green } from "@ant-design/colors";
import { PlusCircleOutlined } from "@ant-design/icons";
import { useHistory } from "react-router-dom";
import { START_GUEST_MATCH } from "../../graphql/mutations.js";
import { useMutation } from "@apollo/client";

const NewMatch = (props) => {
  const [players, setPlayers] = useState([]);
  const [playerName, setPlayerName] = useState("");
  const [matchName, setMatchName] = useState("");

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (text) => <b>{text}</b>,
    },
    {
      title: "",
      key: "",
      width: 100,
      render: (text, record) => {
        return (
          <a href="/#" onClick={() => removePlayer(record.name)}>
            Remove
          </a>
        );
      },
    },
  ];

  const removePlayer = (name) => {
    let tmp = players.filter((p) => p.name !== name);
    setPlayers(tmp);
  };

  const onAddPlayer = () => {
    const name = playerName;
    if (!name) {
      return;
    }
    const isExistedName = players.some(
      (p) => p.name.toLowerCase() === name.toLowerCase()
    );
    if (isExistedName) {
      message.error("Player name already exists");
      return;
    }
    setPlayers([...players, { name }]);
    setPlayerName("");
  };

  const onPlayerInputKeyUp = ({ key }) => {
    if (key === "Enter") {
      onAddPlayer();
    }
  };

  return (
    <Space direction="vertical" style={{ width: "100%" }}>
      <Typography.Title level={2}>New Match</Typography.Title>
      <Row gutter={[8, 8]}>
        <Col span={16}>
          <Input
            placeholder="Match name"
            value={matchName}
            onChange={(e) => setMatchName(e.target.value)}
          ></Input>
        </Col>
      </Row>
      <Row gutter={[8, 8]}>
        <Col span={16}>
          <Input
            placeholder="Player name"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            onKeyUp={onPlayerInputKeyUp}
          />
        </Col>
        <Col flex="60px">
          <Button
            type="primary"
            style={{ width: "100%" }}
            color={green.primary}
            icon={<PlusCircleOutlined />}
            onClick={onAddPlayer}
          ></Button>
        </Col>
      </Row>
      <Row>
        <Col span={24}>
          <Table
            size="small"
            rowKey="name"
            columns={columns}
            dataSource={players}
            pagination={false}
          ></Table>
        </Col>
      </Row>
      <Row>
        <Col>
          <StartMatch matchData={{ matchName, players }}></StartMatch>
        </Col>
      </Row>
    </Space>
  );
};
NewMatch.propTypes = {};

export default NewMatch;

export const StartMatch = ({ matchData }) => {
  let history = useHistory();
  const [
    startGuestMatch,
    { data, loading, error },
  ] = useMutation(START_GUEST_MATCH, { errorPolicy: "all" });

  const onStartMatch = () => {
    const playerNames = Object.keys(matchData.players).map(
      (key) => matchData.players[key].name
    );
    startGuestMatch({
      variables: {
        name: matchData.matchName,
        players: playerNames,
      },
    });
  };

  useEffect(() => {
    const messageKey = "create_match";
    if (loading) {
      message.loading({
        content: "Starting a new match...",
        key: messageKey,
      });
    } else if (error) {
      message.error({ content: `${error}`, key: messageKey, duration: 0 });
    } else if (data) {
      message.destroy(messageKey);
      history.push(`/playing/${data.startGuestMatch.id}`);
    }
  }, [data, loading, error, history]);

  return (
    <div>
      <Button type="primary" onClick={onStartMatch} loading={loading}>
        Start
      </Button>
    </div>
  );
};
