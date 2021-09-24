import { gql } from "@apollo/client";

export const LOAD_GUEST_MATCH = gql`
  query LoadGuestMatch($id: Int!) {
    match(id: $id) {
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
