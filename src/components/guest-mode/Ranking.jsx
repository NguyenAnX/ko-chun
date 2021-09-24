import React, { useState, useEffect } from "react";
import { useParams, useHistory } from "react-router-dom";
import { useQuery } from "@apollo/client";
import { Button, message, Space, Spin, Typography, Table, Tag } from "antd";
import { LOAD_GUEST_MATCH } from "../../graphql/queries";
import URI from "../../constants/uri";
const { Title, Text } = Typography;

const Ranking = () => {
  let history = useHistory();
  const { matchId } = useParams();
  const [matchData, setMatchData] = useState({});
  const [loading, setLoading] = useState(false);
  const {
    data: loadMatchResp,
    error: loadMatchError,
  } = useQuery(LOAD_GUEST_MATCH, { variables: { id: parseInt(matchId) } });

  useEffect(() => {
    setLoading(true);
    if (loadMatchError) {
      message.error(`${loadMatchError}`, 0);
      return null;
    }
    if (loadMatchResp && loadMatchResp.match) {
      let players = [...loadMatchResp.match.players];
      players = players.sort((p1, p2) => {
        return p1.curScore < p2.curScore ? 1 : -1;
      });
      setMatchData({
        ...loadMatchResp.match,
        players,
      });
      setLoading(false);
    }
  }, [loadMatchResp, loadMatchError]);

  const startNewMatch = () => {
    history.push(URI.ROOT);
  };

  const continuePlaying = () => {
    history.push(`${URI.PLAYING}${matchId}`);
  };

  const positionColor = {
    1: "green",
    2: "gold",
    3: "red",
  };
  const columns = [
    {
      title: "Position",
      key: "position",
      render: (_, __, index) => {
        return <Tag color={positionColor[index + 1]}>{index + 1}</Tag>;
      },
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (text) => <b>{text}</b>,
    },
    {
      title: "Score",
      dataIndex: "curScore",
      key: "curScore",
    },
  ];

  return (
    <Spin spinning={loading}>
      <Title level={2}>{`${matchData.name}`}</Title>
      <Space direction="vertical" size="middle" style={{ width: "100%" }}>
        <Text strong type="success">{`Played ${
          matchData.round - 1
        } rounds`}</Text>
        <Table
          rowKey="id"
          columns={columns}
          dataSource={matchData.players}
          pagination={false}
        ></Table>
        <Space>
          <Button type="primary" onClick={startNewMatch}>
            New Match
          </Button>
          <Button type="primary" onClick={continuePlaying}>
            Continue Playing
          </Button>
        </Space>
      </Space>
    </Spin>
  );
};

Ranking.propTypes = {};

export default Ranking;
