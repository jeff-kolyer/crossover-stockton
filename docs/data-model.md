\# Crossover Stockton — Resource Data Model (Draft)



This document defines the minimum viable structure for a resource.



\## Resource Fields



\- id (string)  

\- name (string)  

\- description (string)  

\- address (string)  

\- phone (string)  

\- website (string, optional)  



\## Tags



\- track\_eligibility: \[A, B, C, D]  

\- pet\_friendly: boolean  

\- rv\_allowed: boolean  

\- employment\_compatible: boolean  

\- medical\_only: boolean  



\## Notes



\- Resources may belong to multiple tracks.  

\- Tags are first-class filters in the MVP.  

\- No resource may force long-term shelter pathways for Track A users.



