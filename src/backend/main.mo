import Map "mo:core/Map";
import Set "mo:core/Set";
import Int "mo:core/Int";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Array "mo:core/Array";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import MixinStorage "blob-storage/Mixin";
import Order "mo:core/Order";
import Storage "blob-storage/Storage";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  // Initialize the authorization system
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  include MixinStorage();

  type CollegeStudentID = {
    photo : Storage.ExternalBlob;
    fullName : Text;
    dateOfBirth : Text;
    enrollmentNo : Text;
    course : Text;
    branch : Text;
    collegeName : Text;
    academicYear : Text;
    validUntil : Text;
  };

  type OtherID = {
    photo : Storage.ExternalBlob;
    fullName : Text;
    idType : Text;
    idNumber : Text;
    dateOfBirth : Text;
    issueDate : Text;
    expiryDate : Text;
    issuedBy : Text;
  };

  type IDType = {
    #collegeStudent : CollegeStudentID;
    #other : OtherID;
  };

  type IDCard = {
    id : Text;
    cardType : IDType;
    timestamp : Time.Time;
  };

  module IDCard {
    func compareById(a : IDCard, b : IDCard) : Order.Order {
      Text.compare(a.id, b.id);
    };

    public func compareByTimestamp(a : IDCard, b : IDCard) : Order.Order {
      switch (Int.compare(a.timestamp, b.timestamp)) {
        case (#equal) { compareById(a, b) };
        case (order) { order };
      };
    };
  };

  // User profile management
  public type UserProfile = {
    name : Text;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // ID Card storage
  let cards = Map.empty<Principal, Map.Map<Text, IDCard>>();
  let usedEnrollmentNos = Set.empty<Text>();

  public shared ({ caller }) func createCollegeID(
    id : Text,
    photo : Storage.ExternalBlob,
    fullName : Text,
    dateOfBirth : Text,
    enrollmentNo : Text,
    course : Text,
    branch : Text,
    collegeName : Text,
    academicYear : Text,
    validUntil : Text,
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create ID cards");
    };
    if (usedEnrollmentNos.contains(enrollmentNo)) {
      Runtime.trap("[Canister] Enrollment number already exists. ");
    };
    let collegeID : CollegeStudentID = {
      photo;
      fullName;
      dateOfBirth;
      enrollmentNo;
      course;
      branch;
      collegeName;
      academicYear;
      validUntil;
    };
    let idCard : IDCard = {
      id;
      cardType = #collegeStudent(collegeID);
      timestamp = Time.now();
    };
    addCard(caller, idCard);
    usedEnrollmentNos.add(enrollmentNo);
  };

  public shared ({ caller }) func createOtherID(
    id : Text,
    photo : Storage.ExternalBlob,
    fullName : Text,
    idType : Text,
    idNumber : Text,
    dateOfBirth : Text,
    issueDate : Text,
    expiryDate : Text,
    issuedBy : Text,
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create ID cards");
    };
    let otherID : OtherID = {
      photo;
      fullName;
      idType;
      idNumber;
      dateOfBirth;
      issueDate;
      expiryDate;
      issuedBy;
    };
    let idCard : IDCard = {
      id;
      cardType = #other(otherID);
      timestamp = Time.now();
    };
    addCard(caller, idCard);
  };

  public query ({ caller }) func getCard(id : Text) : async IDCard {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access ID cards");
    };
    switch (cards.get(caller)) {
      case (null) { Runtime.trap("[Canister] Card not found. ") };
      case (?userCards) {
        switch (userCards.get(id)) {
          case (null) { Runtime.trap("[Canister] Card not found. ") };
          case (?card) { card };
        };
      };
    };
  };

  public query ({ caller }) func getAllCards() : async [IDCard] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access ID cards");
    };
    switch (cards.get(caller)) {
      case (null) { Runtime.trap("[Canister] No cards found. ") };
      case (?userCards) { userCards.values().toArray() };
    };
  };

  public query ({ caller }) func getSortedCards(sortBy : Text) : async [IDCard] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access ID cards");
    };
    switch (cards.get(caller)) {
      case (null) { Runtime.trap("[Canister] No cards found. ") };
      case (?userCards) {
        let cardsArray = userCards.values().toArray();
        cardsArray.sort(IDCard.compareByTimestamp);
      };
    };
  };

  public shared ({ caller }) func updateCard(id : Text, card : IDCard) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update ID cards");
    };
    switch (cards.get(caller)) {
      case (null) { Runtime.trap("[Canister] Card not found. ") };
      case (?userCards) {
        if (not userCards.containsKey(id)) {
          Runtime.trap("[Canister] Card not found. ");
        };
        userCards.add(id, card);
      };
    };
  };

  public shared ({ caller }) func deleteCard(id : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete ID cards");
    };
    switch (cards.get(caller)) {
      case (null) { Runtime.trap("[Canister] Card not found. ") };
      case (?userCards) {
        if (not userCards.containsKey(id)) {
          Runtime.trap("[Canister] Card not found. ");
        };
        userCards.remove(id);
      };
    };
  };

  func addCard(user : Principal, card : IDCard) {
    switch (cards.get(user)) {
      case (null) {
        let newUserCards = Map.singleton<Text, IDCard>(card.id, card);
        cards.add(user, newUserCards);
      };
      case (?userCards) { userCards.add(card.id, card) };
    };
  };
};
