import Map "mo:core/Map";
import Text "mo:core/Text";
import Array "mo:core/Array";
import List "mo:core/List";
import Principal "mo:core/Principal";
import ExternalBlob "blob-storage/Storage";
import MixinStorage "blob-storage/Mixin";
import Runtime "mo:core/Runtime";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

import Nat "mo:core/Nat";
import Time "mo:core/Time";
import Iter "mo:core/Iter";


actor {
  include MixinStorage();

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // Data Structures
  public type AudioFile = {
    id : Text;
    name : Text;
    blob : Text;
    fileSize : Nat;
    mimeType : Text;
    uploadDate : Time.Time;
    owner : Principal;
  };

  public type UserProfile = {
    name : Text;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();
  let audioFiles = Map.empty<Text, AudioFile>();

  // Profile Management
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    enforceUserRole(caller);
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    enforceOwnershipOrAdmin(caller, user, "user profile");
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    enforceUserRole(caller);
    userProfiles.add(caller, profile);
  };

  // Core Functions
  public shared ({ caller }) func uploadAudio(fileName : Text, mimeType : Text, exclusiveUrl : Text, fileSize : Nat) : async Text {
    enforceUserRole(caller);

    let id = exclusiveUrl;

    let audio : AudioFile = {
      id;
      name = fileName;
      fileSize;
      mimeType;
      uploadDate = Time.now();
      blob = exclusiveUrl;
      owner = caller;
    };

    audioFiles.add(id, audio);
    id;
  };

  public query ({ caller }) func getMyAudioFiles() : async [AudioFile] {
    enforceUserRole(caller);

    let filteredIter = audioFiles.values().filter(func(audio) { audio.owner == caller });
    filteredIter.toArray();
  };

  public shared ({ caller }) func deleteAudio(id : Text) : async () {
    enforceUserRole(caller);

    switch (audioFiles.get(id)) {
      case (null) { Runtime.trap("Audio file not found") };
      case (?audio) {
        enforceOwnershipOrAdmin(caller, audio.owner, "audio file");
        audioFiles.remove(id);
      };
    };
  };

  public shared ({ caller }) func renameAudio(id : Text, newName : Text) : async () {
    enforceUserRole(caller);

    let trimmed = newName.trim(#char ' ');
    if (trimmed.size() == 0) {
      Runtime.trap("Name cannot be empty");
    };

    switch (audioFiles.get(id)) {
      case (null) { Runtime.trap("Audio file not found") };
      case (?audio) {
        enforceOwnershipOrAdmin(caller, audio.owner, "audio file");
        let updatedAudio = { audio with name = trimmed };
        audioFiles.add(id, updatedAudio);
      };
    };
  };

  // Helper Functions
  func enforceUserRole(caller : Principal) {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can perform this action");
    };
  };

  func enforceOwnershipOrAdmin(caller : Principal, owner : Principal, resourceType : Text) {
    if (caller != owner and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap(
        "Unauthorized: Can only manage your own " # resourceType # " unless you are admin"
      );
    };
  };
};
