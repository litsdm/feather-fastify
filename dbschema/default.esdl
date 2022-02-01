module default {
  type User {
    required property email -> str {
      constraint exclusive;
    }
    required property password -> str;
    required property username -> str;
  
    property createdAt -> str;
    property updatedAt -> str;
    property lastConnection -> str;
    property placeholderColor -> str;
    property profilePic -> str;
    property tag -> str;
    property discriminator -> str;
    property expoToken -> str;
    property recentlySent -> array<str>;

    property isPro -> bool {
      default := false
    }
    property role -> str {
      default := "user"
    }
    property remainingBytes -> int64 {
      default := 2147483648
    }
    property remainingTransfers -> int16 {
      default := 3
    }
  }
}
