module default {
  type User {
    property email -> str {
      constraint exclusive;
    }
    property password -> str;
    property username -> str;
  
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
    property remainingTransfers -> int16 {
      default := 3
    }
  }

  type File {
    property createdAt -> str;
    property updatedAt -> str;
    property expiresAt -> str;

    required property name -> str;
    required property size -> int64;
    property url -> str;
    property hostFilename -> str;
    property fileType -> str;
    property senderDevice -> str;

    property remainingExpiryModifications -> int16 {
      default := 2
    }
  }
}
