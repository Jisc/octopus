import * as publicationService from 'publication/service';
import * as publicationVersionService from 'publicationVersion/service';

export const getPublicationVersionByDoi = async (doi: string) => {
    let publicationVersion = await publicationVersionService.getOAIPublicationVersion(doi);

    if (!publicationVersion) {
        // Maybe this is a publication DOI that is being passed in
        // try to get the latest live version for that publication
        const publication = await publicationService.getOAIPublication(doi);

        if (!publication) {
            return null;
        }

        const livePublicationVersion = publication.versions.find((v) => v.isLatestLiveVersion);

        if (livePublicationVersion) {
            publicationVersion = livePublicationVersion;
        }
    }

    if (!publicationVersion) {
        return null;
    }

    return publicationVersion;
};
