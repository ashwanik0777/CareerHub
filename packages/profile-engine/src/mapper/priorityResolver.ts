/**
 * Priority Resolver
 * Handles logic for selecting the "best" item from an array (e.g. current job, latest degree).
 */

export class PriorityResolver {
  static getLatestEducation(educations: any[] | undefined): any | null {
    if (!educations || educations.length === 0) return null;
    
    // Sort by endDate descending (null endDate means current, put those first)
    const sorted = [...educations].sort((a, b) => {
      if (a.isCurrent && !b.isCurrent) return -1;
      if (!a.isCurrent && b.isCurrent) return 1;
      
      const timeA = a.endDate ? new Date(a.endDate).getTime() : 0;
      const timeB = b.endDate ? new Date(b.endDate).getTime() : 0;
      return timeB - timeA;
    });

    return sorted[0];
  }

  static getCurrentExperience(experiences: any[] | undefined): any | null {
    if (!experiences || experiences.length === 0) return null;

    // Sort by isCurrent, then by startDate descending
    const sorted = [...experiences].sort((a, b) => {
      if (a.isCurrent && !b.isCurrent) return -1;
      if (!a.isCurrent && b.isCurrent) return 1;
      
      const timeA = a.startDate ? new Date(a.startDate).getTime() : 0;
      const timeB = b.startDate ? new Date(b.startDate).getTime() : 0;
      return timeB - timeA;
    });

    return sorted[0];
  }
}
