package tn.ooredoo.backend.entities;


import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.Date;
import java.util.Set;

@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Entity

public class RetentionCampaign {


    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long retentionID;
    String name;
    String offerDetails;
    Date startDate;
    Date endDate;
    Float budget;
    Float engagementRate;

    @ManyToMany
    Set<TargetSegment> targetSegmentList;



}
