import { gql } from "@apollo/client";

export const START_GUEST_MATCH = gql`
  mutation StartGuestMatch($name: String, $players: [String]) {
    startGuestMatch(name: $name, players: $players) {
      id
      name
      isFinished
      round
      players {
        id
        name
        curScore
        preScore
      }
    }
  }
`;

export const FINISH_ROUND = gql`
  mutation FinishRound($matchId: Int, $players: [RoundPlayerInput]) {
    finishRound(matchId: $matchId, players: $players) {
      id
      name
      isFinished
      round
      players {
        id
        name
        curScore
        preScore
      }
    }
  }
`;

export const ROLLBACK_PREVIOUS_ROUND = gql`
  mutation RollbackPreviousRound($matchId: Int) {
    rollbackPreviousRound(matchId: $matchId) {
      id
      name
      isFinished
      round
      players {
        id
        name
        curScore
        preScore
      }
    }
  }
`;

export const FINISH_MATCH = gql`
  mutation FinishMatch($matchId: Int) {
    finishMatch(id: $matchId) {
      id
      name
      isFinished
      round
      players {
        id
        name
        curScore
        preScore
      }
    }
  }
`;
