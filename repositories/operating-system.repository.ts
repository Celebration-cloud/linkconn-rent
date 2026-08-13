import "server-only";

import { ApplicationRepository } from "@/repositories/application.repository";
import { ConversationRepository } from "@/repositories/conversation.repository";
import { ListingRepository } from "@/repositories/listing.repository";
import { PropertyDiscoveryRepository } from "@/repositories/property-discovery.repository";
import { SavedPropertyRepository } from "@/repositories/saved-property.repository";
import { VerificationRepository } from "@/repositories/verification.repository";
import { ViewingRepository } from "@/repositories/viewing.repository";

/**
 * Compatibility façade for established Route Handler imports.
 * New server code should depend on the domain repository that owns its data.
 */
export class OperatingSystemRepository {
  static searchProperties = PropertyDiscoveryRepository.search;
  static countProperties = PropertyDiscoveryRepository.count;
  static listSavedPropertyIds = SavedPropertyRepository.listIds;
  static saveProperty = SavedPropertyRepository.save;
  static removeSavedProperty = SavedPropertyRepository.remove;
  static createApplication = ApplicationRepository.create;
  static listLandlordApplications = ApplicationRepository.listForLandlord;
  static decideApplication = ApplicationRepository.decide;
  static createViewing = ViewingRepository.create;
  static createOrFindConversation = ConversationRepository.createOrFind;
  static listConversations = ConversationRepository.list;
  static listMessages = ConversationRepository.listMessages;
  static sendMessage = ConversationRepository.sendMessage;
  static archiveConversation = ConversationRepository.archive;
  static saveDraft = ListingRepository.saveDraft;
  static updateFees = ListingRepository.updateFees;
  static listVerificationSubmissions = VerificationRepository.list;
  static saveVerificationDraft = VerificationRepository.saveDraft;
}
