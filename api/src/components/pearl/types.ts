export interface StudyItemResponse {
    data: {
        getStudyItem: StudyItem;
    };
}

export interface StudyListResponse {
    data: {
        getStudyList: {
            Count: number;
            Results: Pick<StudyItem, 'FriendlyId' | 'LatestEditionReleaseDate'>[];
        };
    };
}

export interface StudyItem {
    Abstract: string | null;
    AccessCondition: string | null;
    AccessPermissions: AccessPermission[];
    AlternativeTitle: string | null;
    Anonymisation: string | null;
    ChangeLog: ChangeLogEntry[];
    Citation: CitationEntry[];
    CleaningOperation: string[] | null;
    CollectionDate: number[] | null;
    CollectionEnd: string | null;
    CollectionStart: string | null;
    Confidentiality: string | null;
    Contact: string[];
    Contributor: string[];
    ControlOperation: string | null;
    Copyright: string | null;
    Country: string[];
    Creator: {
        Organisations: string[];
        Individuals: string[];
    };
    DOI: string | null;
    DataCollectionMethodology: IdValuePair[];
    DataCollector: string[];
    DataFormat: DataFormatEntry[];
    Datasets: DatasetEntry[];
    DateOfCollection: string | null;
    DepositDate: string | null;
    Depositor: {
        Organisations: string[];
        Individuals: string[];
    };
    DeviationFromSample: string | null;
    Disclaimer: string | null;
    Documents: DocumentEntry[];
    EditionNumber: number | null;
    EmbargoEndDate: string | null;
    EmbargoStartDate: string | null;
    Embargoed: boolean;
    FirstEditionReleaseDate: string | null;
    FriendlyId: string;
    GrantNo: string[] | null;
    Id: string;
    Keyword: IdValuePair[];
    KindOfData: string[] | null;
    LanguageOfStudyDescription: string[] | null;
    LanguageOfStudyDocumentation: string[] | null;
    LatestEditionReleaseDate: string | null;
    MainTopics: string | null;
    NumberOfVariables: number | null;
    ObservationUnit: string[] | null;
    ObservationUnitLocation: string[] | null;
    OtherGeography: string | null;
    PublicationDate: string | null;
    Publisher: string[] | null;
    Region: string | null;
    ReleaseNumber: number | null;
    Resources: {
        RelatedResource: RelatedResourceEntry[];
        RelatedStudy: RelatedStudyEntry[];
    };
    SamplingProcedure: string[] | null;
    SeriesId: string | null;
    SeriesTitle: string | null;
    SpatialUnit: string[] | null;
    Sponsor: {
        Organisations: string[];
        Individuals: string[];
    };
    Status: string | null;
    StatusChangeDate: string | null;
    SubTitle: string | null;
    Subject: string[] | null;
    TeachingData: boolean;
    TimeMethod: IdValuePair[];
    TimePeriod: string | null;
    TimePeriodEnd: string | null;
    TimePeriodStart: string | null;
    Title: string;
    Town: string | null;
    TypeOfAccess: string | null;
    URN: string | null;
    Universe: string | null;
    Version: number | null;
    WeightingMethodology: string[] | null;
}

export interface AccessPermission {
    Title: string;
    Uri: string;
    UriText: string;
}

export interface ChangeLogEntry {
    ChangeLogChangeDate: string;
    ChangeLogText: string;
    DoiIdentifierName: string | null;
    MinorChangeLog: string[] | null;
    StudyCitationText: string;
}

export interface CitationEntry {
    ContentType: string;
    StudyCitationText: string;
}

export interface IdValuePair {
    Id: string | null;
    Value: string;
    Comment?: string | null;
}

export interface DataFormatEntry extends IdValuePair {
    Comment: string | null;
}

export interface DatasetEntry {
    Id: string;
    Title: string;
}

export interface DocumentEntry {
    Description: string;
    Name: string;
    Size: string;
    Type: string;
    Uri: string;
}

export interface RelatedResourceEntry {
    Name: string;
    Type: string;
    Uri: string;
}

export interface RelatedStudyEntry {
    Name: string;
    FriendlyID: string;
    Uri: string;
}
