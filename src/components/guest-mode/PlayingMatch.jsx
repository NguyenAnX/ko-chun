import React, { useState, useEffect } from "react";
import { useParams, useHistory } from "react-router-dom";
import { useQuery, useMutation } from "@apollo/client";
import {
  Button,
  message,
  Popconfirm,
  Space,
  Spin,
  Table,
  Typography,
} from "antd";
import { red, green } from "@ant-design/colors";
import { LOAD_GUEST_MATCH } from "../../graphql/queries";
import {
  FINISH_MATCH,
  FINISH_ROUND,
  ROLLBACK_PREVIOUS_ROUND,
} from "../../graphql/mutations";
import URI from "../../constants/uri";

const { Title } = Typography;

const PlayingMatch = () => {
  let history = useHistory();
  const { matchId } = useParams();
  const [matchData, setMatchData] = useState({});
  const [loading, setLoading] = useState(false);
  const [visiblePopupRollback, setVisiblePopupRollback] = useState(false);
  const {
    data: loadMatchResp,
    error: loadMatchError,
  } = useQuery(LOAD_GUEST_MATCH, { variables: { id: parseInt(matchId) } });
  const [sendFinishRoundReq] = useMutation(FINISH_ROUND);
  const [sendRollbackRoundReq] = useMutation(ROLLBACK_PREVIOUS_ROUND);
  const [sendFinishMatchReq] = useMutation(FINISH_MATCH);

  useEffect(() => {
    setLoading(true);
    if (loadMatchError) {
      message.error(`${loadMatchError}`, 0);
      return null;
    }
    if (loadMatchResp && loadMatchResp.match) {
      setMatchData(resetRoundScore(loadMatchResp.match));
      setLoading(false);
    }
  }, [loadMatchResp, loadMatchError]);

  const gainScore = (playerId, score) => {
    const updatedPlayers = matchData.players.map((p) => {
      if (p.id === playerId) {
        const newRoundScore = p.roundScore + score;
        return {
          ...p,
          roundScore: newRoundScore,
        };
      }
      return p;
    });

    const newMatchData = {
      ...matchData,
      players: updatedPlayers,
    };
    setMatchData(newMatchData);
  };

  const resetRoundScore = (match) => {
    const players = match.players.map((p) => {
      return {
        ...p,
        roundScore: 0,
      };
    });

    return {
      ...match,
      players,
    };
  };

  const handleResetRoundScore = () => {
    const resetMatch = resetRoundScore(matchData);
    setMatchData(resetMatch);
  };

  const canFinishRound = () => {
    const players = matchData.players;
    const sum = players.reduce((acc, p) => {
      return acc + p.roundScore;
    }, 0);

    return sum === 0;
  };

  const finishRound = () => {
    if (!canFinishRound()) {
      message.error("Round score not match", 2);
      return;
    }
    setLoading(true);
    const playerRoundScores = matchData.players.map((p) => {
      return {
        id: p.id,
        gainScore: p.roundScore,
      };
    });

    sendFinishRoundReq({
      variables: {
        matchId: parseInt(matchId),
        players: playerRoundScores,
      },
    })
      .then(({ data }) => {
        if (data.finishRound) {
          setMatchData(resetRoundScore(data.finishRound));
        }
      })
      .catch((error) => {
        message.error(`${error}`, 2);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const rollbackRound = () => {
    setLoading(true);
    sendRollbackRoundReq({
      variables: {
        matchId: parseInt(matchId),
      },
    })
      .then(({ data }) => {
        if (data.rollbackPreviousRound) {
          setMatchData(resetRoundScore(data.rollbackPreviousRound));
        }
      })
      .catch((error) => {
        message.error(`${error}`, 2);
      })
      .finally(() => {
        setLoading(false);
        setVisiblePopupRollback(false);
      });
  };

  const finishMatch = () => {
    setLoading(true);
    sendFinishMatchReq({
      variables: {
        matchId: parseInt(matchId),
      },
    })
      .then(({ data }) => {
        if (data.finishMatch) {
          history.push(`${URI.RANKING}${matchId}`);
        }
      })
      .catch((error) => {
        message.error(`${error}`, 2);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (text) => <b>{text}</b>,
    },
    {
      title: "Actions",
      dataIndex: "actions",
      key: "actions",
      render: (text, record) => {
        const scores = [2, 1, -1, -2];
        const playerId = record.id;
        return (
          <Space>
            {scores.map((score) => {
              return (
                <Button
                  shape="circle"
                  type="primary"
                  danger={score < 0}
                  onClick={() => {
                    gainScore(playerId, score);
                  }}
                >
                  {score < 0 ? "" : "+"}
                  {score}
                </Button>
              );
            })}
          </Space>
        );
      },
    },
    {
      title: "Score",
      dataIndex: "curScore",
      key: "curScore",
      render: (text, record) => {
        const formatRoundScore = (score) => {
          if (score === 0) return "";
          if (score < 0)
            return <span style={{ color: red.primary }}>{score}</span>;
          return <span style={{ color: green.primary }}>+{score}</span>;
        };
        return (
          <span>
            <b>{text}</b>
            &nbsp;{formatRoundScore(record.roundScore)}
          </span>
        );
      },
    },
  ];

  return (
    <Spin spinning={loading}>
      <Space direction="vertical" style={{ width: "100%" }} size="middle">
        <Title
          level={2}
        >{`${matchData.name} - Round ${matchData.round}`}</Title>
        <Table
          rowKey="id"
          columns={columns}
          dataSource={matchData.players}
          pagination={false}
        ></Table>
        <Space>
          <Button type="primary" onClick={finishRound}>
            Next Round
          </Button>
          <Button type="primary" onClick={handleResetRoundScore}>
            Clear
          </Button>
          <Popconfirm
            title="Are you sure to rollback to previous round?"
            placement="bottom"
            visible={visiblePopupRollback}
            onConfirm={rollbackRound}
            onCancel={() => {
              setVisiblePopupRollback(false);
            }}
          >
            <Button
              type="primary"
              onClick={() => {
                setVisiblePopupRollback(true);
              }}
            >
              Rollback
            </Button>
          </Popconfirm>

          <Button
            danger
            type="primary"
            onClick={finishMatch}
            style={{ float: "right" }}
          >
            End Game
          </Button>
        </Space>
      </Space>
    </Spin>
  );
};

PlayingMatch.propTypes = {};

export default PlayingMatch;
